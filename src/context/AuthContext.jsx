import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { watchAuth, getUserDoc, ensureUserDoc } from '../firebase/authService'
import { touchLastSeen, saveProfile } from '../firebase/userService'
import { SUPER_ADMINS } from '../utils/constants'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // firebase auth user
  const [profile, setProfile] = useState(null) // firestore users/{uid} doc
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (uid) => {
    const id = uid || user?.uid
    if (!id) return
    const p = await getUserDoc(id)
    setProfile(p)
    return p
  }, [user])

  useEffect(() => {
    return watchAuth(async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        try {
          const p = await ensureUserDoc(fbUser)  // create doc if missing
          setProfile(p)
          touchLastSeen(fbUser.uid)  // presence heartbeat
          // bootstrap: promote owner emails to admin in the DB (best-effort, works once rules allow)
          const email = (fbUser.email || '').toLowerCase()
          if (SUPER_ADMINS.includes(email) && p?.role !== 'admin') {
            saveProfile(fbUser.uid, { role: 'admin' }).then(() => refresh(fbUser.uid)).catch(() => {})
          }
        } catch { setProfile(null) }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  const email = (user?.email || '').toLowerCase()
  const isAdmin = profile?.role === 'admin' || SUPER_ADMINS.includes(email)

  return (
    <AuthCtx.Provider value={{ user, profile, loading, refresh, setProfile, isAdmin }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
