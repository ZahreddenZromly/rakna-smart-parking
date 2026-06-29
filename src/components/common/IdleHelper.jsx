import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Mascot from './Mascot'

const IDLE_MS = 3 * 60 * 1000 // 3 min of no activity → Rukna checks in
const ACTIVITY = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel']

// Don't interrupt the user on these surfaces (landing / onboarding / dashboards)
const SKIP = ['/', '/onboarding', '/login', '/register', '/phone-login']
const isQuiet = (path) => SKIP.includes(path) || path.startsWith('/admin') || path.startsWith('/operator')

// A worried Rukna that gently offers help when the user has been idle for a while.
export default function IdleHelper() {
  const { t, speak } = useSettings()
  const location = useLocation()
  const navigate = useNavigate()
  const [show, setShow] = useState(false)
  const timer = useRef(null)

  const quiet = isQuiet(location.pathname)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset stale popup when entering a quiet route
    if (quiet) { setShow(false); return }
    if (sessionStorage.getItem('rakna_idle_snooze') === '1') return // user said "not now" this session

    const arm = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        setShow(true)
        speak(t('idle_help_q'))
      }, IDLE_MS)
    }
    const onActivity = () => arm() // any activity restarts the 15s countdown

    ACTIVITY.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    arm()
    return () => {
      clearTimeout(timer.current)
      ACTIVITY.forEach((e) => window.removeEventListener(e, onActivity))
    }
  }, [quiet, location.pathname, speak, t])

  if (quiet || !show) return null

  const dismiss = () => { setShow(false); sessionStorage.setItem('rakna_idle_snooze', '1') }
  const acceptHelp = () => {
    setShow(false)
    // open the in-app assistant (it lives on the map page)
    sessionStorage.setItem('rakna_open_assistant', '1')
    window.dispatchEvent(new CustomEvent('rakna:open-assistant'))
    if (location.pathname !== '/map') navigate('/map')
  }

  return (
    <div style={{ position: 'fixed', insetInlineStart: '50%', transform: 'translateX(-50%)', bottom: 96, zIndex: 1900, width: 'min(420px, 92vw)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, background: C.white,
        borderRadius: R.card, padding: '12px 14px', boxShadow: SHADOW.float, animation: 'popIn 0.35s ease',
        border: '1.5px solid ' + C.yellow,
      }}>
        <button className="rukna-btn" onClick={() => speak(t('idle_help_q'))} title={t('tap_me_hint')} aria-label={t('tap_me_hint')} style={{ flexShrink: 0, width: 50 }}>
          <Mascot size={50} mood="worried" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.black }}>{t('idle_help_q')}</div>
          <div style={{ fontSize: '0.74rem', color: C.textMuted, lineHeight: 1.4 }}>{t('idle_help_sub')}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={acceptHelp} style={{
              padding: '7px 14px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
              background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '0.78rem',
            }}>{t('idle_yes')}</button>
            <button onClick={dismiss} style={{
              padding: '7px 14px', borderRadius: R.pill, cursor: 'pointer',
              border: '1.5px solid ' + C.greyMid, background: C.white, color: C.textSoft, fontWeight: 600, fontSize: '0.78rem',
            }}>{t('idle_no')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
