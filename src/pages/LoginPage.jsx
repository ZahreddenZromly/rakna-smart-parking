import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { loginUser } from '../firebase/authService'
import Icon from '../components/common/Icon'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { t } = useSettings()

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await loginUser(form.email, form.password)
      navigate('/map')
    } catch {
      setErr('Wrong email or password.')
      setBusy(false)
    }
  }
  const field = { width: '100%', padding: '15px 16px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '1rem', boxSizing: 'border-box', outline: 'none', background: C.grey, color: C.text }
  const label = { display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.85rem' }

  return (
    <div style={{ minHeight: '100vh', background: C.frame, display: 'flex', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', background: C.white, padding: '0 28px', boxShadow: '0 0 60px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="logo" size={52} color={C.black} strokeWidth={1.8} /></div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: C.black, margin: '12px 0 4px' }}>{t('welcome_back')}</h1>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: 0 }}>{t('sign_in_continue')}</p>
        </div>

        <form onSubmit={submit} style={{ marginTop: 40 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={label}>{t('email')}</label>
            <input style={field} type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={label}>{t('password')}</label>
            <input style={field} type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          {err && <div style={{ background: '#FFE5E3', color: C.danger, padding: '10px 14px', borderRadius: R.md, fontSize: '0.85rem', marginBottom: 12 }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ width: '100%', padding: '17px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: busy ? 'wait' : 'pointer', boxShadow: SHADOW.yellow, opacity: busy ? 0.7 : 1 }}>{busy ? t('loading') : t('sign_in')}</button>
        </form>

        <button onClick={() => navigate('/phone-login')} style={{ width: '100%', padding: '15px', marginTop: 12, borderRadius: R.pill, border: '1.5px solid ' + C.greyMid, background: C.white, color: C.black, fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><Icon name="phone" size={18} /> {t('login_phone')}</span>
        </button>

        <p style={{ textAlign: 'center', marginTop: 24, color: C.textSoft, fontSize: '0.9rem' }}>
          {t('no_account')} <Link to="/register" style={{ color: C.black, fontWeight: 700, textDecoration: 'none' }}>{t('sign_up')}</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8 }}>
          <Link to="/operator/login" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '0.85rem' }}>{t('operator_portal')} →</Link>
        </p>
      </div>
    </div>
  )
}
