import { useLocation, useNavigate } from 'react-router-dom'
import { C, FONT, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'

const NAV = [
  { to: '/map',             key: 'nav_home',     icon: 'home'   },
  { to: '/my-reservations', key: 'nav_bookings', icon: 'ticket' },
  { to: '/loyalty',         key: 'nav_rewards',  icon: 'star'   },
  { to: '/profile',         key: 'nav_profile',  icon: 'user'   },
]

const EXTRA_NAV = [
  { to: '/news',    key: 'nav_news',    icon: 'news'    },
  { to: '/partner', key: 'nav_partner', icon: 'partner' },
]

function NavIcon({ name, active, size = 24, color }) {
  const stroke = color || (active ? 'var(--brand)' : 'rgba(255,255,255,0.55)')
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'home':    return <svg {...c}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
    case 'ticket':  return <svg {...c}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M15 7v10" strokeDasharray="2 2" /></svg>
    case 'star':    return <svg {...c}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9Z" /></svg>
    case 'user':    return <svg {...c}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-3.5 3.6-6 8-6s8 2.5 8 6" /></svg>
    case 'news':    return <svg {...c}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h6" /></svg>
    case 'partner': return <svg {...c}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    default: return null
  }
}

function BottomNavIcon({ name, active }) {
  const stroke = active ? C.black : C.textMuted
  const c = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'home':   return <svg {...c}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>
    case 'ticket': return <svg {...c}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M15 7v10" strokeDasharray="2 2" /></svg>
    case 'star':   return <svg {...c}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9Z" /></svg>
    case 'user':   return <svg {...c}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-3.5 3.6-6 8-6s8 2.5 8 6" /></svg>
    default: return null
  }
}

function SidebarNavLink({ item, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', padding: '13px 22px',
      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      border: 'none', borderLeft: active ? '3px solid var(--brand)' : '3px solid transparent',
      cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
      color: active ? '#fff' : 'rgba(255,255,255,0.65)',
      fontFamily: FONT, fontSize: '0.9rem', fontWeight: active ? 700 : 400,
    }}>
      <NavIcon name={item.icon} active={active} size={20} />
      <span style={{ flex: 1 }}>{item.label}</span>
    </button>
  )
}

export default function MobileLayout({ children, bottomNav = true, bg = C.grey, pad = true }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, speak } = useSettings()

  const allNav = [...NAV, ...EXTRA_NAV]

  return (
    <div className="rl-shell" style={{ fontFamily: FONT }}>

      {/* ---- Desktop sidebar (hidden on mobile via CSS) ---- */}
      <nav className="rl-sidebar">
        {/* Logo */}
        <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#fff', letterSpacing: '-0.5px' }}>ركنة</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 2, letterSpacing: '0.04em' }}>RAKNA PARKING</div>
        </div>

        {/* Primary nav */}
        <div style={{ flex: 1, paddingTop: 16 }}>
          {allNav.map((n) => (
            <SidebarNavLink
              key={n.to}
              item={{ ...n, label: t(n.key) }}
              active={location.pathname === n.to || location.pathname.startsWith(n.to + '/')}
              onClick={() => { speak(t(n.key)); navigate(n.to) }}
            />
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{ padding: '20px 24px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
            Rakna Smart Parking<br />© {new Date().getFullYear()}
          </div>
        </div>
      </nav>

      {/* ---- Content area ---- */}
      <div className="rl-main" style={{ background: bg }}>

        {/* Scrollable content */}
        <div className={['rl-scroll', pad ? 'rl-pad' : '', bottomNav ? 'rl-nbpad' : ''].filter(Boolean).join(' ')}>
          {children}
        </div>

        {/* ---- Bottom nav (phone + tablet only) ---- */}
        {bottomNav && (
          <div className="rl-bottom-nav" style={{
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
                    <BottomNavIcon name={n.icon} active={active} />
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
