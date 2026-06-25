import { useEffect, useState } from 'react'
import {
  subscribeLotQueue, subscribeQueueState, subscribeUserEntries,
  reconcileQueue, isActive,
} from '../firebase/queueService'

// Live queue for one lot + this user's active entry in it.
// Also reconciles (expire/promote) on a timer so offers time out even if the
// person holding one has closed the app.
export function useLotQueue(lotId, userId) {
  const [entries, setEntries] = useState([])
  const [freeSlots, setFreeSlots] = useState(0)

  useEffect(() => {
    if (!lotId) return
    const unsubQ = subscribeLotQueue(lotId, setEntries)
    const unsubS = subscribeQueueState(lotId, (s) => setFreeSlots(s.freeSlots || 0))
    return () => { unsubQ(); unsubS() }
  }, [lotId])

  // periodic reconcile while anyone is looking at the queue
  useEffect(() => {
    if (!lotId) return
    const id = setInterval(() => { reconcileQueue(lotId).catch(() => {}) }, 12000)
    return () => clearInterval(id)
  }, [lotId])

  const active = entries.filter(isActive)
  const myEntry = userId ? entries.find((e) => e.userId === userId && isActive(e)) : null
  return { entries, active, freeSlots, myEntry, waitingCount: active.length }
}

// All of this user's queue entries across lots (for the global watcher).
export function useMyEntries(userId) {
  const [entries, setEntries] = useState([])
  useEffect(() => {
    if (!userId) return
    return subscribeUserEntries(userId, setEntries)
  }, [userId])
  return userId ? entries : [] // derive the signed-out case instead of clearing state
}
