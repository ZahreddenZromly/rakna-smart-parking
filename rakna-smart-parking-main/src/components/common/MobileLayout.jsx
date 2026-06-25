import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { FONT } from '../../styles/theme'

const NAV = [
  { to: '/home',             key: 'nav_home',     icon: 'fa-house' },
  { to: '/map',              key: 'nav_map',      icon: 'fa-map-location-dot' },
  { to: '/my-reservations',  key: 'nav_bookings', icon: 'fa-ticket' },
  { to: '/loyalty',          key: 'nav_rewards',  icon: 'fa-star' },
  { to: '/profile',          key: 'nav_profile',  icon: 'fa-circle-user' },
]

function TopNavBar() {
  const location = useLocation()
  const { t, theme } = useSettings()
  const { user, profile } = useAuth()
  const logo = theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'

  return (
    <nav style={{
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--nav-border)',
      height: 64,
      position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 1px 8px rgba(15,34,77,0.07)',
      fontFamily: FONT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1200,
        padding: '0 clamp(16px, 4vw, 48px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* اليمين — اللوقو */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src={logo} alt="ركنة" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* الوسط — روابط التنقل */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {NAV.map(({ to, icon, key }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 10, textDecoration: 'none',
                background: active ? 'var(--brand-soft)' : 'transparent',
                color: active ? 'var(--brand)' : 'var(--text-muted)',
                fontWeight: active ? 700 : 500, fontSize: '0.88rem',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: 14 }} />
                <span className="nav-label">{t(key)}</span>
              </Link>
            )
          })}
        </div>

        {/* اليسار — حساب دائماً */}
        <Link to={user ? '/profile' : '/login'} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          textDecoration: 'none', flexShrink: 0,
          padding: '7px 14px', borderRadius: 10,
          background: 'var(--brand-soft)',
          color: 'var(--brand)',
          fontWeight: 700, fontSize: '0.88rem',
          whiteSpace: 'nowrap',
        }}>
          <i className="fa-solid fa-circle-user" style={{ fontSize: 15 }} />
          {user ? (profile?.name?.split(' ')[0] || t('profile')) : t('sign_in')}
        </Link>
      </div>
    </nav>
  )
}

export default function MobileLayout({ children, bottomNav = true, pad = true }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, speak } = useSettings()

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      fontFamily: FONT, display: 'flex', flexDirection: 'column',
    }}>
      <div className="desktop-nav-wrapper">
        <TopNavBar />
      </div>

      <div className="no-scrollbar mobile-content" style={{
        flex: 1, overflowY: 'auto',
        padding: pad ? '0 clamp(16px, 4vw, 48px)' : 0,
        paddingBottom: pad ? 'calc(64px + clamp(16px, 4vw, 48px))' : '64px',
        maxWidth: '100%',
      }}>
        {children}
      </div>

      {bottomNav && (
        <div className="mobile-bottom-nav" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: 'var(--nav-bg)',
          borderTop: '1px solid var(--nav-border)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          height: 64, padding: '0 8px',
          boxShadow: '0 -4px 20px rgba(15,34,77,0.08)',
          zIndex: 100,
        }}>
          {NAV.map((n) => {
            const active = location.pathname === n.to
            return (
              <button
                key={n.to}
                onClick={() => { speak?.(t(n.key)); navigate(n.to) }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  flex: 1, padding: '6px 0', fontFamily: FONT,
                }}
              >
                <div style={{
                  width: 40, height: 28, borderRadius: 10,
                  background: active ? 'var(--brand-soft)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}>
                  <i className={`fa-solid ${n.icon}`} style={{
                    fontSize: 16,
                    color: active ? 'var(--brand)' : 'var(--text-muted)',
                    transition: 'color 0.2s',
                  }} />
                </div>
                <span style={{
                  fontSize: '0.62rem', fontWeight: active ? 700 : 500,
                  color: active ? 'var(--brand)' : 'var(--text-muted)',
                }}>
                  {t(n.key)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}