import { db } from './config'
import {
  collection, addDoc, getDocs, query, where, orderBy,
  updateDoc, doc, serverTimestamp,
} from 'firebase/firestore'

export const createReservation = async (userId, data) => {
  const ref = await addDoc(collection(db, 'reservations'), {
    ...data,
    userId,
    status: 'active',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getUserReservations = async (userId) => {
  // single-field where avoids needing a composite index; sort client-side
  const q = query(collection(db, 'reservations'), where('userId', '==', userId))
  const snap = await getDocs(q)
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
}

export const cancelReservation = (id) =>
  updateDoc(doc(db, 'reservations', id), { status: 'cancelled' })
