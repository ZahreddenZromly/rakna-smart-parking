import { db, storage } from './config'
import {
  collection, getDocs, query, orderBy, doc, setDoc, getDoc, addDoc, deleteDoc,
  serverTimestamp, increment, updateDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { fileToCompressedDataURL } from '../utils/image'

export const uploadContentImage = async (file, folder = 'content') => {
  const dataUrl = await fileToCompressedDataURL(file, 800, 0.75)
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  const path = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, blob)
  return getDownloadURL(storageRef)
}

// Built-in fallback content shown when the admin hasn't added any yet.
export const DEFAULT_ADS = [
  { id: 'a1', title: '50% Off First Booking', subtitle: 'Use code RAKNA50 at checkout', emoji: '🎉', bg: '#F9DD4E' },
  { id: 'a2', title: 'Refer a Friend', subtitle: 'Get 100 loyalty points each', emoji: '🤝', bg: '#A55EEA' },
  { id: 'a3', title: 'Top up your Wallet', subtitle: 'Add 50 LYD, get 5 LYD free', emoji: '👛', bg: '#26DE81' },
]

export const DEFAULT_NEWS = [
  { id: 'n1', title: 'New disability zone opened', body: 'Bourguiba Station Main Lot now has 12 dedicated accessible spots near the entrance.', emoji: '♿', date: '16 Jun 2026', views: 128, likes: 24 },
  { id: 'n2', title: 'Peak-hour pricing update', body: 'From July, peak hours (8–9 AM, 5–6 PM) will use dynamic pricing to reduce congestion.', emoji: '⚡', date: '12 Jun 2026', views: 342, likes: 51 },
  { id: 'n3', title: 'Wallet payments are live', body: 'You can now pay for parking instantly from your in-app wallet. Top up and skip the card.', emoji: '👛', date: '08 Jun 2026', views: 210, likes: 38 },
]

export const getAds = async () => {
  try {
    const snap = await getDocs(query(collection(db, 'ads'), orderBy('order', 'asc')))
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return rows.length ? rows : DEFAULT_ADS
  } catch {
    return DEFAULT_ADS
  }
}

export const getNews = async () => {
  try {
    const snap = await getDocs(collection(db, 'news'))
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return rows.length ? rows : DEFAULT_NEWS
  } catch {
    return DEFAULT_NEWS
  }
}

// record one view + toggle like (best-effort; ignores permission errors for default content)
export const recordNewsView = async (newsId, uid) => {
  if (!uid) return
  try {
    const ref = doc(db, 'news', newsId, 'views', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, { at: serverTimestamp() })
      await updateDoc(doc(db, 'news', newsId), { views: increment(1) })
    }
  } catch { /* default content / no perms — ignore */ }
}

export const likeNews = async (newsId, uid) => {
  if (!uid) return
  try {
    await setDoc(doc(db, 'news', newsId, 'reactions', uid), { type: 'like', at: serverTimestamp() })
    await updateDoc(doc(db, 'news', newsId), { likes: increment(1) })
  } catch { /* ignore for default content */ }
}

// ---- Admin CRUD: Ads ----
export const addAd = (data) =>
  addDoc(collection(db, 'ads'), { order: Date.now(), createdAt: serverTimestamp(), ...data })
export const updateAd = (id, data) => updateDoc(doc(db, 'ads', id), data)
export const deleteAd = (id) => deleteDoc(doc(db, 'ads', id))

// ---- Admin CRUD: News ----
export const addNews = (data) =>
  addDoc(collection(db, 'news'), {
    views: 0, likes: 0, createdAt: serverTimestamp(),
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    ...data,
  })
export const updateNews = (id, data) => updateDoc(doc(db, 'news', id), data)
export const deleteNews = (id) => deleteDoc(doc(db, 'news', id))
