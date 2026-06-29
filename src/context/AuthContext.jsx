import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { watchAuth, ensureUserDoc } from '../firebase/authService'
import { touchLastSeen, saveProfile } from '../firebase/userService'
import { SUPER_ADMINS } from '../utils/constants'
import { db } from '../firebase/config'
import { doc, onSnapshot } from 'firebase/firestore'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const unsubProfile          = useRef(null)

  // Kept for callers (ProfileSetupPage etc.) — the onSnapshot listener picks up
  // any Firestore write automatically, so this is just a compatibility shim.
  const refresh = () => {}

  useEffect(() => {
    const unsubAuth = watchAuth(async (fbUser) => {
      // tear down previous user's profile listener
      unsubProfile.current?.()
      unsubProfile.current = null

      setUser(fbUser)

      if (!fbUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        await ensureUserDoc(fbUser)
        touchLastSeen(fbUser.uid)

        let first = true
        unsubProfile.current = onSnapshot(
          doc(db, 'users', fbUser.uid),
          (snap) => {
            if (snap.exists()) {
              const p = { id: snap.id, ...snap.data() }
              setProfile(p)
              // Bootstrap SUPER_ADMIN email to admin role (runs once, best-effort)
              const email = (fbUser.email || '').toLowerCase()
              if (SUPER_ADMINS.includes(email) && p.role !== 'admin') {
                saveProfile(fbUser.uid, { role: 'admin' }).catch(() => {})
              }
            } else {
              setProfile(null)
            }
            if (first) { first = false; setLoading(false) }
          },
          () => { setProfile(null); setLoading(false) },
        )
      } catch {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      unsubAuth()
      unsubProfile.current?.()
    }
  }, [])

  const email   = (user?.email || '').toLowerCase()
  const isAdmin = profile?.role === 'admin' || SUPER_ADMINS.includes(email)

  return (
    <AuthCtx.Provider value={{ user, profile, loading, refresh, setProfile, isAdmin }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
