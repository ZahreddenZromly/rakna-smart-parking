import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { registerUser } from '../firebase/authService'
import Icon from '../components/common/Icon'

function AuthBrand({ t }) {
  return (
    <div className="auth-brand">
      <div className="blob" style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'var(--brand)', opacity: 0.28, filter: 'blur(4px)', pointerEvents: 'none' }} />
      <div className="blob-slow" style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'var(--accent)', opacity: 0.15, filter: 'blur(6px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: SHADOW.brand }}>
            <Icon name="logo" size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', fontFamily: FONT }}>ركنة</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', fontFamily: FONT }}>Rakna Smart Parking</div>
          </div>
        </div>

        <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: '0 0 14px', fontFamily: FONT }}>
          {t('splash_title_1')}<br />
          <span style={{ color: 'var(--brand)' }}>{t('splash_title_3')}</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '0.97rem', lineHeight: 1.65, margin: '0 0 40px', fontFamily: FONT, maxWidth: 380 }}>
          {t('splash_sub')}
        </p>

        {[
          { icon: 'map',    label: t('onb1_title') },
          { icon: 'star',   label: t('onb3_title') },
          { icon: 'wallet', label: t('onb2_title') },
        ].map(f => (
          <div key={f.icon} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
              <Icon name={f.icon} size={17} color="var(--brand)" />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.9rem', fontFamily: FONT }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

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

  const fieldStyle = { width: '100%', padding: '14px 16px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '1rem', boxSizing: 'border-box', outline: 'none', background: C.grey, color: C.text, fontFamily: FONT }
  const labelStyle = { display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.85rem', fontFamily: FONT }

  return (
    <div className="auth-shell">
      <AuthBrand t={t} />

      <div className="auth-card">
        <div style={{ textAlign: 'center', paddingTop: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Icon name="logo" size={52} color={C.black} strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: C.black, margin: '12px 0 4px', fontFamily: FONT }}>{t('create_account')}</h1>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: 0, fontFamily: FONT }}>{t('join')}</p>
        </div>

        <form onSubmit={submit} style={{ marginTop: 32 }}>
          {[
            { k: 'name',     label: t('full_name'), type: 'text',     ph: 'Ahmed Al-Mansouri' },
            { k: 'email',    label: t('email'),     type: 'email',    ph: 'you@email.com' },
            { k: 'password', label: t('password'),  type: 'password', ph: '••••••••' },
          ].map((f) => (
            <div key={f.k} style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{f.label}</label>
              <input style={fieldStyle} type={f.type} required value={form[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.ph} />
            </div>
          ))}
          {err && <div style={{ background: '#FFE5E3', color: C.danger, padding: '10px 14px', borderRadius: R.md, fontSize: '0.85rem', marginBottom: 12, fontFamily: FONT }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ marginTop: 8, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: busy ? 'wait' : 'pointer', boxShadow: SHADOW.yellow, opacity: busy ? 0.7 : 1, fontFamily: FONT }}>
            {busy ? t('saving') : t('create_account')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: C.textSoft, fontSize: '0.9rem', paddingBottom: 32, fontFamily: FONT }}>
          {t('have_account_q')} <Link to="/login" style={{ color: C.black, fontWeight: 700, textDecoration: 'none' }}>{t('sign_in')}</Link>
        </p>
      </div>
    </div>
  )
}
