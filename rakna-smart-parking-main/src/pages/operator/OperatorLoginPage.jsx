import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../../firebase/authService'
import { useAuth } from '../../context/AuthContext'
import Mascot from '../../components/common/Mascot'

const FONT = "'Tajawal', system-ui, sans-serif"

export default function OperatorLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)
  const navigate  = useNavigate()
  const { refresh } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const cred = await loginUser(form.email.trim(), form.password)
      const profile = await refresh(cred.user.uid)
      if (profile?.role === 'operator') {
        navigate('/operator/dashboard')
      } else {
        setErr('هذا الحساب ليس حساب مشغل')
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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: FONT, direction: 'rtl' }}>

      {/* يمين — لوحة ملونة */}
      <div className="auth-brand-panel" style={{
        flex: '0 0 45%',
        background: 'linear-gradient(145deg, #0F224D 0%, #1a3a6e 50%, #1D4ED8 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 48, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Mascot size={160} mood="wave" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.8, margin: '20px 0 0', maxWidth: 240 }}>
            بوابة المشغلين<br />أدر موقفك بذكاء
          </p>
        </div>
      </div>

      {/* يسار — الفورم */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#ffffff', padding: 'clamp(32px,5vw,64px)',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          <div className="auth-mobile-header" style={{ textAlign: 'center', marginBottom: 28 }}>
            <Mascot size={90} mood="wave" style={{ margin: '0 auto' }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏢</div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F224D', margin: '0 0 4px' }}>
              بوابة المشغلين
            </h2>
            <p style={{ color: '#8A96AC', fontSize: '0.85rem', margin: 0 }}>
              سجّل دخولك لإدارة موقفك
            </p>
          </div>

          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#4A5A78', fontSize: '0.85rem' }}>
                البريد الإلكتروني
              </label>
              <input style={field} type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="operator@example.com" dir="ltr" />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#4A5A78', fontSize: '0.85rem' }}>
                كلمة المرور
              </label>
              <input style={field} type="password" required value={form.password}
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
                : 'تسجيل الدخول'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#8A96AC', fontSize: '0.88rem' }}>
            <Link to="/login" style={{ color: '#0F224D', fontWeight: 700, textDecoration: 'none' }}>
              ← دخول المستخدمين
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}