import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../../firebase/authService'
import { useAuth } from '../../context/AuthContext'
import { SUPER_ADMINS } from '../../utils/constants'

const FONT = "'Tajawal', system-ui, sans-serif"

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)
  const navigate    = useNavigate()
  const { refresh } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const cred    = await loginUser(form.email.trim(), form.password)
      const uid     = cred.user?.uid || cred.uid
      const profile = await refresh(uid).catch(() => null)
      const email   = form.email.trim().toLowerCase()

      // قبول لو role=admin في Firestore أو إيميله في SUPER_ADMINS
      if (profile?.role === 'admin' || SUPER_ADMINS.includes(email)) {
        navigate('/admin')
      } else {
        setErr('هذا الحساب ليس حساب مدير')
        setBusy(false)
      }
    } catch (e2) {
      setErr(
        e2.code === 'auth/user-not-found'   ? 'البريد الإلكتروني غير مسجل'
        : e2.code === 'auth/wrong-password' ? 'كلمة المرور غير صحيحة'
        : 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      )
      setBusy(false)
    }
  }

  const field = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #D6E0F0', borderRadius: 10,
    fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none',
    background: '#fff', color: '#0F224D', fontFamily: FONT,
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(145deg, #0F224D 0%, #1a3a6e 100%)',
      fontFamily: FONT, direction: 'rtl', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#fff', borderRadius: 20,
        padding: 'clamp(28px,5vw,44px)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
      
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F224D', margin: '0 0 4px' }}>
            لوحة التحكم
          </h2>
          <p style={{ color: '#8A96AC', fontSize: '0.85rem', margin: 0 }}>
            للمديرين فقط
          </p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#4A5A78', fontSize: '0.85rem' }}>
              البريد الإلكتروني
            </label>
            <input style={field} type="email" required autoFocus
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@rakna.ly" dir="ltr" />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#4A5A78', fontSize: '0.85rem' }}>
              كلمة المرور
            </label>
            <input style={field} type="password" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••" />
          </div>

          {err && (
            <div style={{
              background: '#FFF0F0', color: '#D14343', border: '1px solid #FFD0D0',
              padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem', marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className="fa-solid fa-circle-exclamation" /> {err}
            </div>
          )}

          <button type="submit" disabled={busy} style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: '#0F224D', color: '#fff',
            fontWeight: 700, fontSize: '1rem',
            cursor: busy ? 'wait' : 'pointer',
            opacity: busy ? 0.75 : 1, fontFamily: FONT,
            boxShadow: '0 6px 20px rgba(15,34,77,0.25)',
          }}>
            {busy
              ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginLeft: 8 }} />جاري الدخول...</>
              : 'دخول لوحة التحكم'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#8A96AC', fontSize: '0.85rem' }}>
          <Link to="/login" style={{ color: '#0F224D', fontWeight: 700, textDecoration: 'none' }}>
            ← دخول المستخدمين
          </Link>
        </p>
      </div>
    </div>
  )
}