import { useLocation, useNavigate } from 'react-router-dom'
import { C, FONT, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'

const NAV = [
  { to: '/map', key: 'nav_home', icon: 'home' },
  { to: '/my-reservations', key: 'nav_bookings', icon: 'ticket' },
  { to: '/loyalty', key: 'nav_rewards', icon: 'star' },
  { to: '/profile', key: 'nav_profile', icon: 'user' },
]

function Icon({ name, active }) {
  const stroke = active ? C.black : C.textMuted
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'home': return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
    case 'ticket': return <svg {...common}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M15 7v10" strokeDasharray="2 2" /></svg>
    case 'star': return <svg {...common}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9Z" /></svg>
    case 'user': return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-3.5 3.6-6 8-6s8 2.5 8 6" /></svg>
    default: return null
  }
}

export default function MobileLayout({ children, bottomNav = true, bg = C.grey, pad = true }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, speak } = useSettings()

  return (
    <div style={{ minHeight: '100vh', background: C.frame, display: 'flex', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{
        width: '100%', maxWidth: 430, minHeight: '100vh', background: bg,
        position: 'relative', boxShadow: '0 0 60px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div className="no-scrollbar" style={{
          flex: 1, overflowY: 'auto',
          padding: pad ? '0 20px' : 0,
          paddingBottom: bottomNav ? 96 : 0,
        }}>
          {children}
        </div>

        {bottomNav && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: C.white, borderTop: '1px solid ' + C.greyMid,
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            height: 76, padding: '0 8px', boxShadow: SHADOW.float, zIndex: 50,
          }}>
            {NAV.map((n) => {
              const active = location.pathname === n.to
              return (
                <button key={n.to} onClick={() => { speak(t(n.key)); navigate(n.to) }} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  flex: 1, padding: '8px 0',
                }}>
                  <div style={{
                    width: 44, height: 32, borderRadius: 12,
                    background: active ? C.yellow : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}>
                    <Icon name={n.icon} active={active} />
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: active ? 700 : 500, color: active ? C.black : C.textMuted }}>
                    {t(n.key)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
