import { useState, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { phoneSignIn } from '../firebase/authService'
import Icon from '../components/common/Icon'

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

  const field = { width: '100%', padding: '15px 16px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '1.1rem', boxSizing: 'border-box', outline: 'none', background: C.grey, color: C.text }

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
    } catch (e2) {
      setErr('Could not sign in. Try again.'); setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.frame, display: 'flex', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', background: C.white, padding: '0 28px', boxShadow: '0 0 60px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', paddingTop: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="phone" size={48} color={C.black} strokeWidth={1.8} /></div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.black, margin: '12px 0 4px' }}>
            {step === 'phone' ? t('enter_phone_title') : t('verify_title')}
          </h1>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: 0 }}>
            {step === 'phone' ? t('enter_phone_sub') : `${t('verify_sub')} ${phone}`}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={sendCode} style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...field, width: 70, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>🇱🇾 +218</span>
              <input style={field} type="tel" autoFocus value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="91 234 5678" />
            </div>
            {err && <div style={{ color: C.danger, fontSize: '0.82rem', marginTop: 10 }}>{err}</div>}
            <button type="submit" style={{ marginTop: 22, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: SHADOW.yellow }}>
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
                  style={{ width: 46, height: 56, textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, border: '1.5px solid ' + C.greyMid, borderRadius: R.md, outline: 'none', background: C.grey, color: C.text }}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', color: C.textMuted, fontSize: '0.78rem', marginTop: 14 }}>💡 {t('demo_otp')}</p>
            {err && <div style={{ color: C.danger, fontSize: '0.82rem', textAlign: 'center' }}>{err}</div>}
            <button onClick={verify} disabled={busy} style={{ marginTop: 16, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: busy ? 'wait' : 'pointer', boxShadow: SHADOW.yellow, opacity: busy ? 0.7 : 1 }}>
              {busy ? t('loading') : t('verify_btn')}
            </button>
            <button onClick={() => setStep('phone')} style={{ width: '100%', padding: 12, background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', marginTop: 8, fontSize: '0.88rem' }}>
              ← {t('resend_code')}
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '0.85rem' }}>{t('use_email')}</Link>
        </p>
      </div>
    </div>
  )
}
