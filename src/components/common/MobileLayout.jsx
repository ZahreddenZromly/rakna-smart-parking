import { useLocation, useNavigate } from 'react-router-dom'
import { C, FONT, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'

const NAV = [
  { to: '/home',    key: 'nav_home',    icon: 'home'    },
  { to: '/map',     key: 'nav_map',     icon: 'map'     },
  { to: '/news',    key: 'nav_news',    icon: 'news'    },
  { to: '/profile', key: 'nav_profile', icon: 'user'    },
]

const EXTRA_NAV = [
  { to: '/my-reservations', key: 'nav_bookings', icon: 'ticket'  },
  { to: '/loyalty',          key: 'nav_rewards',  icon: 'star'    },
  { to: '/wallet',           key: 'wallet',       icon: 'wallet'  },
]

// Sidebar icons (dark bg)
function NavIcon({ name, active, size = 20 }) {
  const stroke = active ? '#fff' : 'rgba(255,255,255,0.5)'
  const fill   = active ? 'rgba(255,255,255,0.15)' : 'none'
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'home':   return <svg {...c}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h5v-5h4v5h5V9.5" /></svg>
    case 'map':    return <svg {...c}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>
    case 'news':   return <svg {...c}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h7M7 13h5" /></svg>
    case 'user':   return <svg {...c}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-3.5 3.6-6 8-6s8 2.5 8 6" /></svg>
    case 'ticket': return <svg {...c}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M15 7v10" strokeDasharray="2 2" /></svg>
    case 'star':   return <svg {...c}><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8L6.6 19.6l1-6L3.3 9.4l6-.9Z" /></svg>
    case 'wallet': return <svg {...c}><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 12h.01" /></svg>
    default: return null
  }
}

// Bottom nav icons (light bg)
function BottomNavIcon({ name, active }) {
  const brand  = 'var(--brand)'
  const muted  = C.textMuted
  const stroke = active ? brand : muted
  const c = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: active ? 2.2 : 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', transition: 'stroke 0.2s, stroke-width 0.2s' }
  switch (name) {
    case 'home':   return <svg {...c}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h5v-5h4v5h5V9.5" /></svg>
    case 'map':    return <svg {...c}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>
    case 'news':   return <svg {...c}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h7M7 13h5M17 9h.01M17 13h.01" /></svg>
    case 'user':   return <svg {...c}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-3.5 3.6-6 8-6s8 2.5 8 6" /></svg>
    default: return null
  }
}

function SidebarNavLink({ item, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 11,
      width: '100%', padding: '11px 20px 11px 18px',
      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
      border: 'none',
      borderLeft: `3px solid ${active ? 'var(--brand)' : 'transparent'}`,
      borderRadius: '0 10px 10px 0',
      marginRight: 12,
      cursor: 'pointer', textAlign: 'left',
      transition: 'background 0.15s, border-color 0.15s',
      color: active ? '#fff' : 'rgba(255,255,255,0.55)',
      fontFamily: FONT, fontSize: '0.875rem', fontWeight: active ? 600 : 400,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
        background: active ? 'rgba(79,123,245,0.22)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}>
        <NavIcon name={item.icon} active={active} size={17} />
      </div>
      <span style={{ flex: 1 }}>{item.label}</span>
      {active && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
      )}
    </button>
  )
}

function SidebarSection({ label, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ padding: '10px 22px 5px', fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export default function MobileLayout({ children, bottomNav = true, bg = C.grey, pad = true }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, speak } = useSettings()

  const goto = (n) => { speak(t(n.key)); navigate(n.to) }
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

  return (
    <div className="rl-shell" style={{ fontFamily: FONT }}>

      {/* ── Desktop sidebar ────────────────────────────────────── */}
      <nav className="rl-sidebar">

        {/* Logo */}
        <div style={{ padding: '0 20px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--brand) 0%, #2E54E8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(79,123,245,0.45)',
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem', lineHeight: 1 }}>ر</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.2px' }}>ركنة</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.09em', textTransform: 'uppercase', marginTop: 1 }}>Smart Parking</div>
            </div>
          </div>
        </div>

        {/* Primary nav */}
        <div style={{ flex: 1, paddingTop: 12, overflowY: 'auto', scrollbarWidth: 'none' }}>
          <SidebarSection label={t('nav_main') || 'Main'}>
            {NAV.map((n) => (
              <SidebarNavLink key={n.to} item={{ ...n, label: t(n.key) }} active={isActive(n.to)} onClick={() => goto(n)} />
            ))}
          </SidebarSection>

          <div style={{ margin: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

          <SidebarSection label={t('nav_more') || 'More'}>
            {EXTRA_NAV.map((n) => (
              <SidebarNavLink key={n.to} item={{ ...n, label: t(n.key) }} active={isActive(n.to)} onClick={() => goto(n)} />
            ))}
          </SidebarSection>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 22px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)', lineHeight: 1.7 }}>
            <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 1 }}>Rakna Smart Parking</div>
            Bourguiba Station · Tripoli<br />© {new Date().getFullYear()}
          </div>
        </div>
      </nav>

      {/* ── Content area ────────────────────────────────────────── */}
      <div className="rl-main" style={{ background: bg }}>

        <div className={['rl-scroll', pad ? 'rl-pad' : '', bottomNav ? 'rl-nbpad' : ''].filter(Boolean).join(' ')}>
          {children}
        </div>

        {/* ── Bottom nav (phone + tablet) ─────────────────────── */}
        {bottomNav && (
          <div className="rl-bottom-nav" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: C.white,
            borderTop: `1px solid ${C.greyMid}`,
            display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
            height: 72,
            boxShadow: '0 -4px 24px rgba(11,26,64,0.08)',
            zIndex: 50,
          }}>
            {NAV.map((n) => {
              const active = location.pathname === n.to
              return (
                <button
                  key={n.to}
                  onClick={() => goto(n)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 3, flex: 1, padding: '0 4px',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Top line indicator */}
                  <span style={{
                    position: 'absolute', top: 0, left: '50%',
                    transform: `translateX(-50%) scaleX(${active ? 1 : 0})`,
                    width: 32, height: 3, borderRadius: '0 0 4px 4px',
                    background: 'var(--brand)',
                    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                  }} />

                  {/* Icon container */}
                  <div style={{
                    width: 40, height: 32, borderRadius: 10,
                    background: active ? 'var(--brand-soft)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}>
                    <BottomNavIcon name={n.icon} active={active} />
                  </div>

                  <span style={{
                    fontSize: '0.63rem', fontWeight: active ? 700 : 500,
                    color: active ? 'var(--brand)' : C.textMuted,
                    transition: 'color 0.2s',
                    letterSpacing: active ? '-0.01em' : 0,
                  }}>
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
