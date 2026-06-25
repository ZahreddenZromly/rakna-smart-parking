import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { registerUser } from '../firebase/authService'
import Mascot from '../components/common/Mascot'

const FONT = "'Tajawal', system-ui, sans-serif"

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [err,  setErr]  = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { t, theme } = useSettings()

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await registerUser({ ...form, email: form.email.trim() })
      navigate('/setup-profile')
    } catch (e2) {
      setErr(
        e2.code === 'auth/email-already-in-use' ? 'هذا البريد الإلكتروني مسجل مسبقاً'
        : e2.code === 'auth/weak-password'       ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        : e2.code === 'auth/invalid-email'        ? 'البريد الإلكتروني غير صحيح'
        : 'حدث خطأ، تحقق من البيانات'
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
  const label = { display: 'block', fontWeight: 600, marginBottom: 6, color: '#4A5A78', fontSize: '0.85rem' }

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
          <Mascot size={160} mood="happy" style={{ margin: '0 auto' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.8, margin: '20px 0 0', maxWidth: 240 }}>
            انضم إلى ركنة واحجز<br />موقفك بخطوات بسيطة
          </p>
        </div>
      </div>

      {/* يسار — الفورم */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#ffffff', padding: 'clamp(32px, 5vw, 64px)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          <div className="auth-mobile-header" style={{ textAlign: 'center', marginBottom: 20 }}>
            <Mascot size={80} mood="happy" style={{ margin: '0 auto' }} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <img src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'} alt="ركنة" style={{ height: 48, objectFit: 'contain' }} />
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F224D', margin: '0 0 4px', textAlign: 'center' }}>
            {t('create_account')}
          </h2>
          <p style={{ color: '#8A96AC', fontSize: '0.85rem', margin: '0 0 22px', textAlign: 'center' }}>
            {t('join')}
          </p>

          <form onSubmit={submit}>
            {/* الاسم */}
            <div style={{ marginBottom: 12 }}>
              <label style={label}>{t('full_name')}</label>
              <input style={field} type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="أحمد المنصوري" />
            </div>

            {/* رقم الهاتف */}
            <div style={{ marginBottom: 12 }}>
              <label style={label}>{t('phone')}</label>
              <input style={field} type="tel" required value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0912345678" dir="ltr" />
            </div>

            {/* البريد الإلكتروني */}
            <div style={{ marginBottom: 12 }}>
              <label style={label}>{t('email')}</label>
              <input style={field} type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@gmail.com" dir="ltr" />
            </div>

            {/* كلمة المرور */}
            <div style={{ marginBottom: 20 }}>
              <label style={label}>{t('password')}</label>
              <input style={field} type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••" />
            </div>

            {err && (
              <div style={{
                background: '#FFF0F0', color: '#D14343', border: '1px solid #FFD0D0',
                padding: '10px 14px', borderRadius: 10, fontSize: '0.85rem', marginBottom: 14,
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
                ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginLeft: 8 }} />{t('saving')}</>
                : t('create_account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#8A96AC', fontSize: '0.88rem' }}>
            {t('have_account_q')}{' '}
            <Link to="/login" style={{ color: '#0F224D', fontWeight: 700, textDecoration: 'none' }}>
              {t('sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}