import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { phoneSignIn } from '../firebase/authService'
import Icon from '../components/common/Icon'

export default function PhoneLoginPage() {
  const navigate  = useNavigate()
  const { t }     = useSettings()
  const [step,  setStep]  = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp,   setOtp]   = useState(['','','','','',''])
  const [busy,  setBusy]  = useState(false)
  const [err,   setErr]   = useState('')
  const boxes = useRef([])

  const field = {
    width: '100%', padding: '15px 16px',
    border: '1.5px solid var(--border)',
    borderRadius: R.md, fontSize: '1.1rem',
    boxSizing: 'border-box', outline: 'none',
    background: 'var(--input-bg)', color: C.black,
    fontFamily: FONT,
  }

  const sendCode = (e) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 7) { setErr(t('enter_phone_sub')); return }
    setErr(''); setStep('otp')
    setTimeout(() => boxes.current[0]?.focus(), 100)
  }

  const setDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]; next[i] = v; setOtp(next)
    if (v && i < 5) boxes.current[i + 1]?.focus()
  }

  const verify = async () => {
    if (otp.join('').length < 6) { setErr(t('verify_title')); return }
    setBusy(true); setErr('')
    try {
      const { isNew } = await phoneSignIn(phone)
      navigate(isNew ? '/setup-profile' : '/map')
    } catch {
      setErr(t('please_login')); setBusy(false)
    }
  }

  return (
    <>
      <style>{`
        .phone-card {
          width: 100%;
          min-height: 100vh;
          background: var(--surface);
          padding: 0 clamp(20px,6vw,40px);
          box-shadow: 0 0 60px rgba(0,0,0,0.10);
        }
        @media (min-width: 768px) {
          .phone-root {
            background: var(--bg);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }
          .phone-card {
            min-height: unset;
            max-width: 480px;
            border-radius: 28px;
            padding: clamp(32px,5vw,56px);
            box-shadow: 0 16px 48px rgba(15,34,77,0.12);
          }
        }
      `}</style>

      <div className="phone-root" style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: FONT }}>
        <div className="phone-card">
          {/* الهيدر */}
          <div style={{ textAlign: 'center', paddingTop: 64 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Icon name="phone" size={48} color="var(--brand)" strokeWidth={1.8} />
            </div>
            <h1 style={{ fontSize: 'clamp(1.3rem,4vw,1.7rem)', fontWeight: 800, color: C.black, margin: '12px 0 4px', fontFamily: FONT }}>
              {step === 'phone' ? t('enter_phone_title') : t('verify_title')}
            </h1>
            <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: 0, fontFamily: FONT }}>
              {step === 'phone' ? t('enter_phone_sub') : `${t('verify_sub')} ${phone}`}
            </p>
          </div>

          {/* إدخال الهاتف */}
          {step === 'phone' ? (
            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ ...field, width: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                  🇱🇾 +218
                </span>
                <input
                  style={field} type="tel" autoFocus
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="91 234 5678"
                  onKeyDown={(e) => e.key === 'Enter' && sendCode(e)}
                />
              </div>
              {err && <div style={{ color: 'var(--error)', fontSize: '0.82rem', marginTop: 10, fontFamily: FONT }}>{err}</div>}
              <button
                onClick={sendCode}
                style={{
                  marginTop: 22, width: '100%', padding: '17px',
                  borderRadius: R.pill, border: 'none', outline: 'none',
                  background: 'var(--brand)', color: 'var(--on-ink)',
                  fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                  boxShadow: SHADOW.brand, fontFamily: FONT,
                }}
              >
                {t('send_code')}
              </button>
            </div>
          ) : (
            /* إدخال الرمز */
            <div style={{ marginTop: 40 }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', direction: 'ltr' }}>
                {otp.map((d, i) => (
                  <input
                    key={i} ref={(el) => (boxes.current[i] = el)}
                    value={d} onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !d && i > 0) boxes.current[i - 1]?.focus() }}
                    inputMode="numeric" maxLength={1}
                    style={{
                      width: 46, height: 56, textAlign: 'center',
                      fontSize: '1.5rem', fontWeight: 700,
                      border: '1.5px solid var(--border)',
                      borderRadius: R.md, outline: 'none',
                      background: 'var(--input-bg)', color: C.black,
                      fontFamily: FONT,
                    }}
                  />
                ))}
              </div>
              <p style={{ textAlign: 'center', color: C.textMuted, fontSize: '0.78rem', marginTop: 14, fontFamily: FONT }}>
                💡 {t('demo_otp')}
              </p>
              {err && <div style={{ color: 'var(--error)', fontSize: '0.82rem', textAlign: 'center', fontFamily: FONT }}>{err}</div>}
              <button
                onClick={verify} disabled={busy}
                style={{
                  marginTop: 16, width: '100%', padding: '17px',
                  borderRadius: R.pill, border: 'none', outline: 'none',
                  background: 'var(--brand)', color: 'var(--on-ink)',
                  fontWeight: 700, fontSize: '1rem',
                  cursor: busy ? 'wait' : 'pointer',
                  boxShadow: SHADOW.brand, opacity: busy ? 0.7 : 1,
                  fontFamily: FONT,
                }}
              >
                {busy ? t('loading') : t('verify_btn')}
              </button>
              <button
                onClick={() => setStep('phone')}
                style={{
                  width: '100%', padding: 12, background: 'none',
                  border: 'none', outline: 'none',
                  color: C.textMuted, cursor: 'pointer',
                  marginTop: 8, fontSize: '0.88rem', fontFamily: FONT,
                }}
              >
                ← {t('resend_code')}
              </button>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, paddingBottom: 40 }}>
            <Link to="/login" style={{ color: C.textMuted, textDecoration: 'none', fontSize: '0.85rem', fontFamily: FONT }}>
              {t('use_email')}
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}