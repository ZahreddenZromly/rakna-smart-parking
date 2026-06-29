import { useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { phoneSignIn } from '../firebase/authService'
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
          { icon: 'phone',  label: t('enter_phone_title') },
          { icon: 'shield', label: t('verify_title') },
          { icon: 'map',    label: t('onb1_title') },
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

export default function PhoneLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/home'
  const { t } = useSettings()
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const boxes = useRef([])

  const fieldStyle = { width: '100%', padding: '15px 16px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none', background: C.grey, color: C.text, fontFamily: FONT }

  const sendCode = (e) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 7) { setErr('Enter a valid phone number'); return }
    setErr(''); setStep('otp')
    setTimeout(() => boxes.current[0]?.focus(), 100)
  }

  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]; next[i] = v; setOtp(next)
    if (v && i < 5) boxes.current[i + 1]?.focus()
  }

  const verify = async () => {
    if (otp.join('').length < 6) { setErr('Enter the 6-digit code'); return }
    setBusy(true); setErr('')
    try {
      const { isNew } = await phoneSignIn(phone)
      navigate(isNew ? '/setup-profile' : redirectTo)
    } catch {
      setErr('Could not sign in. Try again.'); setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <AuthBrand t={t} />

      <div className="auth-card">
        <div style={{ textAlign: 'center', paddingTop: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Icon name="phone" size={48} color={C.black} strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.black, margin: '12px 0 4px', fontFamily: FONT }}>
            {step === 'phone' ? t('enter_phone_title') : t('verify_title')}
          </h1>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: 0, fontFamily: FONT }}>
            {step === 'phone' ? t('enter_phone_sub') : `${t('verify_sub')} ${phone}`}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={sendCode} style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...fieldStyle, width: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>🇱🇾 +218</span>
              <input style={fieldStyle} type="tel" autoFocus value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="91 234 5678" />
            </div>
            {err && <div style={{ color: C.danger, fontSize: '0.82rem', marginTop: 10, fontFamily: FONT }}>{err}</div>}
            <button type="submit" style={{ marginTop: 22, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: SHADOW.yellow, fontFamily: FONT }}>
              {t('send_code')}
            </button>
          </form>
        ) : (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', direction: 'ltr' }}>
              {otp.map((d, i) => (
                <input
                  key={i} ref={(el) => (boxes.current[i] = el)}
                  value={d} onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) boxes.current[i - 1]?.focus() }}
                  inputMode="numeric" maxLength={1}
                  style={{ width: 48, height: 58, textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, border: '1.5px solid ' + C.greyMid, borderRadius: R.md, outline: 'none', background: C.grey, color: C.text }}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', color: C.textMuted, fontSize: '0.78rem', marginTop: 14, fontFamily: FONT }}>💡 {t('demo_otp')}</p>
            {err && <div style={{ color: C.danger, fontSize: '0.82rem', textAlign: 'center', fontFamily: FONT }}>{err}</div>}
            <button onClick={verify} disabled={busy} style={{ marginTop: 16, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: busy ? 'wait' : 'pointer', boxShadow: SHADOW.yellow, opacity: busy ? 0.7 : 1, fontFamily: FONT }}>
              {busy ? t('loading') : t('verify_btn')}
            </button>
            <button onClick={() => setStep('phone')} style={{ width: '100%', padding: 12, background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', marginTop: 8, fontSize: '0.88rem', fontFamily: FONT }}>
              ← {t('resend_code')}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, paddingBottom: 32 }}>
          <Link to="/login" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '0.85rem', fontFamily: FONT }}>{t('use_email')}</Link>
        </p>
      </div>
    </div>
  )
}
