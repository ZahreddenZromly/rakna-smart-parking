import { db } from './config'
import {
  collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'

// B2B partner leads — businesses that want Rakna to run smart parking for their space.
// Pipeline: new → contacted → qualified → won / lost
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost']

export async function submitLead(data) {
  const ref = await addDoc(collection(db, 'partnerLeads'), {
    ...data,
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export function subscribeLeads(cb) {
  return onSnapshot(
    collection(db, 'partnerLeads'),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (e) => { if (e?.code !== 'permission-denied') console.warn('partner leads:', e?.code || e); cb([]) },
  )
}

export const setLeadStatus = (id, status) =>
  updateDoc(doc(db, 'partnerLeads', id), { status, updatedAt: serverTimestamp() })

export const removeLead = (id) => deleteDoc(doc(db, 'partnerLeads', id))
