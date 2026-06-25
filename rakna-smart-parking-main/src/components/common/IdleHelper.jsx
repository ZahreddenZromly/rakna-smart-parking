import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Mascot from './Mascot'

const IDLE_MS = 15000
const ACTIVITY = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel']
const SKIP = ['/', '/onboarding', '/login', '/register', '/phone-login']
const isQuiet = (path) => SKIP.includes(path) || path.startsWith('/admin') || path.startsWith('/operator')

export default function IdleHelper() {
  const { t, speak } = useSettings()
  const location = useLocation()
  const navigate  = useNavigate()
  const [show, setShow] = useState(false)
  const timer = useRef(null)
  const quiet = isQuiet(location.pathname)

  useEffect(() => {
    if (quiet) { setShow(false); return }
    if (sessionStorage.getItem('rakna_idle_snooze') === '1') return
    const arm = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => { setShow(true); speak(t('idle_help_q')) }, IDLE_MS)
    }
    ACTIVITY.forEach((e) => window.addEventListener(e, arm, { passive: true }))
    arm()
    return () => { clearTimeout(timer.current); ACTIVITY.forEach((e) => window.removeEventListener(e, arm)) }
  }, [quiet, location.pathname, speak, t])

  if (quiet || !show) return null

  const dismiss = () => { setShow(false); sessionStorage.setItem('rakna_idle_snooze', '1') }
  const acceptHelp = () => {
    setShow(false)
    sessionStorage.setItem('rakna_open_assistant', '1')
    window.dispatchEvent(new CustomEvent('rakna:open-assistant'))
    if (location.pathname !== '/map') navigate('/map')
  }

  return (
    <>
      <style>{`
        .idle-helper-wrap {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 80px;
          z-index: 1900;
          width: min(420px, 92vw);
        }
        @media (min-width: 768px) {
          .idle-helper-wrap { bottom: 24px; }
        }
      `}</style>
      <div className="idle-helper-wrap">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: C.white, borderRadius: R.card,
          padding: '12px 14px', boxShadow: SHADOW.float,
          animation: 'popIn 0.35s ease',
          border: '1.5px solid var(--border)',
        }}>
          <button className="rukna-btn" onClick={() => speak(t('idle_help_q'))} title={t('tap_me_hint')} style={{ flexShrink: 0, width: 50 }}>
            <Mascot size={50} mood="worried" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.black }}>{t('idle_help_q')}</div>
            <div style={{ fontSize: '0.74rem', color: C.textMuted, lineHeight: 1.4 }}>{t('idle_help_sub')}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {/* زر نعم — أبيض على كحلي */}
              <button onClick={acceptHelp} style={{
                padding: '7px 14px', borderRadius: R.pill,
                border: 'none', cursor: 'pointer',
                background: 'var(--brand)', color: 'var(--on-ink)',
                fontWeight: 700, fontSize: '0.78rem',
              }}>{t('idle_yes')}</button>
              <button onClick={dismiss} style={{
                padding: '7px 14px', borderRadius: R.pill, cursor: 'pointer',
                border: '1.5px solid var(--border)',
                background: C.white, color: C.textSoft,
                fontWeight: 600, fontSize: '0.78rem',
              }}>{t('idle_no')}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}