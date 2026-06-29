import { db } from './config'
import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  onSnapshot, serverTimestamp, query, where, getDocs,
} from 'firebase/firestore'

export const subscribeOperators = (cb) =>
  onSnapshot(collection(db, 'operators'), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  )

export const addOperator = (data) =>
  addDoc(collection(db, 'operators'), {
    ...data,
    email: (data.email || '').toLowerCase().trim(),
    status: 'active',
    createdAt: serverTimestamp(),
  })

export const removeOperator = (id) =>
  deleteDoc(doc(db, 'operators', id))

export const setOperatorStatus = (id, status) =>
  updateDoc(doc(db, 'operators', id), { status })

export const getOperatorByEmail = async (email) => {
  const q = query(
    collection(db, 'operators'),
    where('email', '==', email.toLowerCase().trim())
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}
