import { Link, useLocation } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { FONT } from '../../styles/theme'

const NAV = [
  { to: '/map',             icon: 'fa-map-location-dot', key: 'nav_map' },
  { to: '/my-reservations', icon: 'fa-ticket',           key: 'nav_bookings' },
  { to: '/loyalty',         icon: 'fa-star',             key: 'nav_rewards' },
  { to: '/profile',         icon: 'fa-circle-user',      key: 'nav_profile' },
]

export default function Navbar() {
  const location = useLocation()
  const { t, theme } = useSettings()
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
          <img
            src={logo}
            alt="ركنة"
            style={{ height: 38, width: 'auto', objectFit: 'contain' }}
          />
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

        {/* اليسار — تسجيل الدخول */}
        <Link to="/login" style={{
          padding: '7px 18px', borderRadius: 10,
          background: 'var(--brand)', color: 'var(--on-ink)',
          textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem',
          display: 'flex', alignItems: 'center', gap: 6,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          <i className="fa-solid fa-right-to-bracket" style={{ fontSize: 13 }} />
          {t('sign_in')}
        </Link>

      </div>
    </nav>
  )
}