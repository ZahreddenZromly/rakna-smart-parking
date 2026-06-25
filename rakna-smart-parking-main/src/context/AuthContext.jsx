import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { watchAuth, getUserDoc, ensureUserDoc } from '../firebase/authService'
import { touchLastSeen, saveProfile } from '../firebase/userService'
import { SUPER_ADMINS } from '../utils/constants'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
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
          const p = await ensureUserDoc(fbUser)
          setProfile(p)
          touchLastSeen(fbUser.uid)
          // ترقية SUPER_ADMINS تلقائياً
          const email = (fbUser.email || '').toLowerCase()
          if (SUPER_ADMINS.includes(email) && p?.role !== 'admin') {
            saveProfile(fbUser.uid, { role: 'admin' })
              .then(() => refresh(fbUser.uid))
              .catch(() => {})
          }
        } catch { setProfile(null) }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
  }, [])

  const email      = (user?.email || '').toLowerCase()
  const isAdmin    = profile?.role === 'admin'    || SUPER_ADMINS.includes(email)
  const isOperator = profile?.role === 'operator'

  // redirect تلقائي حسب الـ role بعد تسجيل الدخول
  const getHomeRoute = () => {
    if (isAdmin)    return '/admin'
    if (isOperator) return '/operator/dashboard'
    return '/map'
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, refresh, setProfile, isAdmin, isOperator, getHomeRoute }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)