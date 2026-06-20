import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { registerUser } from '../firebase/authService'
import Icon from '../components/common/Icon'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { t } = useSettings()

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await registerUser(form)
      navigate('/setup-profile')
    } catch (e2) {
      setErr(e2.code === 'auth/email-already-in-use' ? 'This email is already registered.'
        : e2.code === 'auth/weak-password' ? 'Password must be at least 6 characters.'
        : 'Could not create account. Check your details.')
      setBusy(false)
    }
  }
  const field = { width: '100%', padding: '15px 16px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '1rem', boxSizing: 'border-box', outline: 'none', background: C.grey, color: C.text }
  const label = { display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.85rem' }

  return (
    <div style={{ minHeight: '100vh', background: C.frame, display: 'flex', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', background: C.white, padding: '0 28px', boxShadow: '0 0 60px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', paddingTop: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="logo" size={52} color={C.black} strokeWidth={1.8} /></div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: C.black, margin: '12px 0 4px' }}>{t('create_account')}</h1>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: 0 }}>{t('join')}</p>
        </div>

        <form onSubmit={submit} style={{ marginTop: 36 }}>
          {[
            { k: 'name', label: t('full_name'), type: 'text', ph: 'Ahmed Al-Mansouri' },
            { k: 'email', label: t('email'), type: 'email', ph: 'you@email.com' },
            { k: 'password', label: t('password'), type: 'password', ph: '••••••••' },
          ].map((f) => (
            <div key={f.k} style={{ marginBottom: 16 }}>
              <label style={label}>{f.label}</label>
              <input style={field} type={f.type} required value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} />
            </div>
          ))}
          {err && <div style={{ background: '#FFE5E3', color: C.danger, padding: '10px 14px', borderRadius: R.md, fontSize: '0.85rem', marginBottom: 12 }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ marginTop: 8, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: busy ? 'wait' : 'pointer', boxShadow: SHADOW.yellow, opacity: busy ? 0.7 : 1 }}>{busy ? t('saving') : t('create_account')}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: C.textSoft, fontSize: '0.9rem' }}>
          {t('have_account_q')} <Link to="/login" style={{ color: C.black, fontWeight: 700, textDecoration: 'none' }}>{t('sign_in')}</Link>
        </p>
      </div>
    </div>
  )
}
