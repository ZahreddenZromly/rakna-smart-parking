import { db } from './config'
import {
  collection, addDoc, getDocs, doc, query, where,
  onSnapshot, updateDoc, setDoc, serverTimestamp, runTransaction, increment,
} from 'firebase/firestore'
import { createReservation } from './reservationService'
import { QUEUE_OFFER_WINDOW_MS, QUEUE_HOLD_MS, QUEUE_AVG_TURNOVER_MIN } from '../utils/constants'

// ============================================================================
// Smart Queue & Reservation System — Firestore-backed, FIFO, client-reconciled.
//
//   queueEntries/{id}  one doc per person-per-lot
//     { lotId, lotName, userId, userName, status, joinedAt,
//       offeredAt, offerExpiresAt(ms epoch), reservedUntil(ms epoch) }
//     status: waiting | offered | accepted | declined | expired | cancelled
//
//   queueState/{lotId}  { freeSlots }   spots currently available to hand out
//
// A spot a person is "holding" is reserved by their active `offered` entry.
// Timeouts are reconciled by any online client (or the admin dashboard) — see
// reconcileQueue(). A Cloud Function could replace it for server-enforced FIFO.
// ============================================================================

const ACTIVE = ['waiting', 'offered']
export const isActive = (e) => ACTIVE.includes(e.status)

// FIFO ordering by joinedAt (sorted client-side to avoid composite indexes)
const byJoined = (a, b) =>
  (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0) ||
  (a.joinedAt?.nanoseconds || 0) - (b.joinedAt?.nanoseconds || 0)

// people ahead of `entry` that are still active → 0-based position
export function positionOf(entries, entry) {
  if (!entry) return -1
  const active = entries.filter(isActive).sort(byJoined)
  return active.findIndex((e) => e.id === entry.id)
}

export const etaMinutes = (position) => Math.max(0, position) * QUEUE_AVG_TURNOVER_MIN

// ---- Subscriptions (real-time) ----
// onError degrades quietly — e.g. permission-denied before the Firestore rules
// for queueEntries/queueState are published.
const onErr = (cb, empty) => (err) => {
  if (err?.code !== 'permission-denied') console.warn('queue listener:', err?.code || err)
  cb(empty)
}

export function subscribeLotQueue(lotId, cb) {
  const q = query(collection(db, 'queueEntries'), where('lotId', '==', lotId))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onErr(cb, []))
}

export function subscribeUserEntries(userId, cb) {
  const q = query(collection(db, 'queueEntries'), where('userId', '==', userId))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onErr(cb, []))
}

export function subscribeAllQueue(cb) {
  return onSnapshot(collection(db, 'queueEntries'), (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onErr(cb, []))
}

export function subscribeQueueState(lotId, cb) {
  return onSnapshot(doc(db, 'queueState', lotId), (s) => cb(s.exists() ? s.data() : { freeSlots: 0 }), onErr(cb, { freeSlots: 0 }))
}

// ---- Join / leave ----
export async function joinQueue({ lotId, lotName, userId, userName }) {
  // single-equality query (auto-indexed); filter lot + status client-side
  const snap = await getDocs(query(collection(db, 'queueEntries'), where('userId', '==', userId)))
  const existing = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .find((e) => e.lotId === lotId && isActive(e))
  if (existing) return existing.id

  const ref = await addDoc(collection(db, 'queueEntries'), {
    lotId, lotName, userId, userName,
    status: 'waiting',
    joinedAt: serverTimestamp(),
    offeredAt: null, offerExpiresAt: null, reservedUntil: null,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  })
  await reconcileQueue(lotId) // in case a spot is already free
  return ref.id
}

export const leaveQueue = (entryId) =>
  updateDoc(doc(db, 'queueEntries', entryId), { status: 'cancelled', updatedAt: serverTimestamp() })

// ---- Offer responses ----
export async function acceptOffer(entry) {
  await updateDoc(doc(db, 'queueEntries', entry.id), {
    status: 'accepted',
    reservedUntil: Date.now() + QUEUE_HOLD_MS,
    acceptedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // surface it in My Bookings (best-effort)
  try {
    await createReservation(entry.userId, {
      lotId: entry.lotId,
      lotName: entry.lotName || '',
      spot: 'Queue reservation',
      source: 'queue',
      hours: 1,
      total: 0,
    })
  } catch { /* ignore */ }
}

export async function declineOffer(entry) {
  await updateDoc(doc(db, 'queueEntries', entry.id), { status: 'declined', updatedAt: serverTimestamp() })
  // the held spot returns to the pool, then offer the next person
  await setDoc(doc(db, 'queueState', entry.lotId), { freeSlots: increment(1), updatedAt: serverTimestamp() }, { merge: true })
  await reconcileQueue(entry.lotId)
}

// ---- Admin: free a spot (a car left) ----
export async function releaseSpot(lotId) {
  await setDoc(doc(db, 'queueState', lotId), { freeSlots: increment(1), updatedAt: serverTimestamp() }, { merge: true })
  await reconcileQueue(lotId)
}

export const removeEntry = (entryId) =>
  updateDoc(doc(db, 'queueEntries', entryId), { status: 'cancelled', updatedAt: serverTimestamp() })

// ----------------------------------------------------------------------------
// Reconcile: expire stale offers (returning their spot) then promote the next
// FIFO waiters while free spots remain. Runs inside a transaction so concurrent
// clients don't double-promote. Safe to call from any signed-in client.
// ----------------------------------------------------------------------------
export async function reconcileQueue(lotId) {
  // prefetch the candidate entries (reads inside the txn re-validate them)
  const snap = await getDocs(query(collection(db, 'queueEntries'), where('lotId', '==', lotId)))
  const candidates = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter(isActive)
    .sort(byJoined)
  if (!candidates.length) return

  const now = Date.now()
  const stateRef = doc(db, 'queueState', lotId)

  await runTransaction(db, async (tx) => {
    const stateSnap = await tx.get(stateRef)
    let free = stateSnap.exists() ? (stateSnap.data().freeSlots || 0) : 0

    // re-read entries inside the txn (all reads before any writes)
    const refs = candidates.map((c) => doc(db, 'queueEntries', c.id))
    const snaps = await Promise.all(refs.map((r) => tx.get(r)))
    const live = snaps
      .map((s, i) => ({ ref: refs[i], data: s.exists() ? s.data() : null }))
      .filter((x) => x.data && isActive(x.data))
      .sort((a, b) => byJoined(a.data, b.data))

    // 1) expire offers past their deadline → spot returns to the pool
    for (const e of live) {
      if (e.data.status === 'offered' && e.data.offerExpiresAt && e.data.offerExpiresAt <= now) {
        tx.update(e.ref, { status: 'expired', updatedAt: serverTimestamp() })
        e.data.status = 'expired'
        free += 1
      }
    }
    // 2) promote the next waiters while spots remain
    for (const e of live) {
      if (free <= 0) break
      if (e.data.status === 'waiting') {
        tx.update(e.ref, {
          status: 'offered',
          offeredAt: now,
          offerExpiresAt: now + QUEUE_OFFER_WINDOW_MS,
          updatedAt: serverTimestamp(),
        })
        e.data.status = 'offered'
        free -= 1
      }
    }
    tx.set(stateRef, { freeSlots: free, updatedAt: serverTimestamp() }, { merge: true })
  })
}
