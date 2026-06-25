import { db } from './config'
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore'

export const addVehicle = (userId, vehicle) =>
  updateDoc(doc(db, 'users', userId), { vehicles: arrayUnion(vehicle) })

export const removeVehicle = (userId, vehicle) =>
  updateDoc(doc(db, 'users', userId), { vehicles: arrayRemove(vehicle) })

export const addPoints = async (userId, points) => {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  const current = snap.data()?.points || 0
  await updateDoc(ref, { points: current + points })
}

export const redeemPoints = async (userId, pointsToRedeem) => {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  const current = snap.data()?.points || 0
  if (current < pointsToRedeem) throw new Error('Not enough points')
  await updateDoc(ref, { points: current - pointsToRedeem })
}

