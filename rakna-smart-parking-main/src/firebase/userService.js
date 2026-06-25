import { db } from './config'
import {
  doc, updateDoc, getDoc, setDoc, collection, addDoc,
  query, where, orderBy, getDocs, serverTimestamp, increment,
} from 'firebase/firestore'

// ---- Profile ----
export const saveProfile = (uid, data) =>
  updateDoc(doc(db, 'users', uid), data)

// presence heartbeat (best-effort)
export const touchLastSeen = async (uid) => {
  try { await updateDoc(doc(db, 'users', uid), { lastSeen: serverTimestamp() }) } catch { /* ignore */ }
}

// ---- Loyalty points ----
export const addPoints = (uid, pts) =>
  updateDoc(doc(db, 'users', uid), { points: increment(pts) })

// ---- Wallet ----
// The balance update is the critical step; logging the transaction is best-effort
// (won't block the balance if the subcollection rule isn't published yet).
const logTxn = async (uid, data) => {
  try {
    await addDoc(collection(db, 'users', uid, 'walletTxns'), { ...data, createdAt: serverTimestamp() })
  } catch { /* txn log optional */ }
}

export const topUpWallet = async (uid, amount, method = 'card') => {
  await updateDoc(doc(db, 'users', uid), { walletBalance: increment(amount) })
  await logTxn(uid, { type: 'topup', amount, method })
}

export const payFromWallet = async (uid, amount, note = 'Parking') => {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  const bal = snap.data()?.walletBalance || 0
  if (bal < amount) throw new Error('insufficient')
  await updateDoc(ref, { walletBalance: increment(-amount) })
  await logTxn(uid, { type: 'payment', amount: -amount, note })
}

export const getWalletTxns = async (uid) => {
  const q = query(collection(db, 'users', uid, 'walletTxns'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
