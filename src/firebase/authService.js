import { auth, db } from './config'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

// Register: create the auth account + a Firestore user doc
export const registerUser = async ({ name, email, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'users', cred.user.uid), {
    name: name || '',
    email,
    role: 'user',
    active: true,
    points: 0,
    walletBalance: 0,
    phone: '',
    nationalId: '',
    plate: '',
    carType: '',
    carColor: '',
    carModel: '',
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  })
  return cred.user
}

// ---- Phone + OTP (demo) ----
// Real SMS OTP needs Firebase Phone Auth (reCAPTCHA + billing). For the MVP we present a
// phone+OTP UX but back it with a deterministic email/password account so it persists for real.
const phoneEmail = (phone) => 'p' + String(phone).replace(/\D/g, '') + '@rakna.local'
const phonePass = (phone) => 'rk_' + String(phone).replace(/\D/g, '')

export const phoneSignIn = async (phone) => {
  const email = phoneEmail(phone)
  const pass = phonePass(phone)
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass)
    return { user: cred.user, isNew: false }
  } catch (e) {
    // user doesn't exist yet -> create the account
    const cred = await createUserWithEmailAndPassword(auth, email, pass)
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: '', email, phone: String(phone), role: 'user', active: true,
      points: 0, walletBalance: 0, nationalId: '', plate: '', carType: '', carColor: '', carModel: '',
      createdAt: serverTimestamp(), lastSeen: serverTimestamp(),
    })
    return { user: cred.user, isNew: true }
  }
}

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const logoutUser = () => signOut(auth)

export const getUserDoc = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Make sure a logged-in account has a Firestore profile doc.
// Handles accounts created directly in the Firebase Auth console (no doc yet).
export const ensureUserDoc = async (fbUser) => {
  const ref = doc(db, 'users', fbUser.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return { id: snap.id, ...snap.data() }
  const data = {
    name: fbUser.displayName || '', email: fbUser.email || '', phone: fbUser.phoneNumber || '',
    role: 'user', active: true, points: 0, walletBalance: 0,
    nationalId: '', plate: '', carType: '', carColor: '', carModel: '',
    createdAt: serverTimestamp(), lastSeen: serverTimestamp(),
  }
  await setDoc(ref, data)
  return { id: fbUser.uid, ...data }
}

export const watchAuth = (cb) => onAuthStateChanged(auth, cb)
