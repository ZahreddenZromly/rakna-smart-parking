import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Config comes from .env (VITE_FIREBASE_*). These web keys are safe to ship in the client;
// real security is enforced by Firestore rules + Auth settings.
// Env vars override; hardcoded fallbacks let the build work anywhere (e.g. Vercel)
// without extra config. Firebase web keys are safe to ship in the client.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBwXCr7R-JvZpMl3GvUUlv95T6GBXJXyiA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'smart-parking-9a26b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'smart-parking-9a26b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'smart-parking-9a26b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1054377673038',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1054377673038:web:52e9c2b774f8d1b24cde1f',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-69KEZB7SC8',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
