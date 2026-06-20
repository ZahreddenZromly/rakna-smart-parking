import { db } from './config'
import {
  collection, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

// ---- Users ----
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export const setUserRole = (uid, role) =>
  updateDoc(doc(db, 'users', uid), { role })

export const setUserActive = (uid, active) =>
  updateDoc(doc(db, 'users', uid), { active })

// "online" = lastSeen within the last 5 minutes
export const isOnline = (u) => {
  const ls = u.lastSeen?.seconds ? u.lastSeen.seconds * 1000 : 0
  return Date.now() - ls < 5 * 60 * 1000
}

// ---- Reservations (analytics) ----
export const getAllReservations = async () => {
  const snap = await getDocs(collection(db, 'reservations'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ---- Parking lots (admin-managed overrides stored in Firestore) ----
export const getLotOverrides = async () => {
  const snap = await getDocs(collection(db, 'lots'))
  const map = {}
  snap.docs.forEach((d) => { map[d.id] = d.data() })
  return map
}

export const saveLot = (id, data) =>
  setDoc(doc(db, 'lots', id), { ...data, updatedAt: serverTimestamp() }, { merge: true })
