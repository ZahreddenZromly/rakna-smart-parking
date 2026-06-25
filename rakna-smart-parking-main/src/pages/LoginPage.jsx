import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { loginUser } from '../firebase/authService'
import Mascot from '../components/common/Mascot'

const FONT = "'Tajawal', system-ui, sans-serif"

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { t, theme } = useSettings()

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await loginUser(form.email.trim(), form.password)
      navigate('/map')
    } catch (e2) {
      setErr(
        e2.code === 'auth/user-not-found'   ? 'البريد الإلكتروني غير مسجل'
        : e2.code === 'auth/wrong-password' ? 'كلمة المرور غير صحيحة'
        : e2.code === 'auth/invalid-email'  ? 'البريد الإلكتروني غير صحيح'
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

      {/* يمين — لوحة ملونة (ديسكتوب) */}
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
            احجز موقفك بسهولة وأمان<br />في أي مكان بطرابلس
          </p>
        </div>
      </div>

      {/* يسار — الفورم */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#ffffff', padding: 'clamp(32px, 5vw, 64px)',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          <div className="auth-mobile-header" style={{ textAlign: 'center', marginBottom: 28 }}>
            <Mascot size={90} mood="wave" style={{ margin: '0 auto' }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="ركنة" style={{ height: 52, objectFit: 'contain' }} />
          </div>

          <p style={{ color: '#8A96AC', fontSize: '0.88rem', margin: '0 0 28px', textAlign: 'center' }}>
            {t('sign_in_continue')}
          </p>

          <form onSubmit={submit}>
            {/* البريد الإلكتروني */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#4A5A78', fontSize: '0.85rem' }}>
                {t('email')}
              </label>
              <input style={field} type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@gmail.com" dir="ltr" />
            </div>

            {/* كلمة المرور */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: '#4A5A78', fontSize: '0.85rem' }}>
                {t('password')}
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
                ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginLeft: 8 }} />{t('loading')}</>
                : t('sign_in')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#8A96AC', fontSize: '0.88rem' }}>
            {t('no_account')}{' '}
            <Link to="/register" style={{ color: '#0F224D', fontWeight: 700, textDecoration: 'none' }}>
              {t('sign_up')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}