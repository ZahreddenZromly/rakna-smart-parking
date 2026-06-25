import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDyzbOZOsyhWgO9WCv4h9aHPBsIxQOAnAU",
  authDomain: "rakna-parking.firebaseapp.com",
  projectId: "rakna-parking",
  storageBucket: "rakna-parking.firebasestorage.app",
  messagingSenderId: "144702209526",
  appId: "1:144702209526:web:661c0472e9a59c3fa81bd7",
  measurementId: "G-Q72D18GHH7"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app