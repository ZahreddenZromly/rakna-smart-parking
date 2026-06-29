import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../firebase/authService'
import Icon from '../components/common/Icon'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { t, isRTL } = useSettings()
  const { user, profile, isAdmin } = useAuth()

  const ITEMS = [
    // Admin only
    ...(isAdmin ? [{ icon: 'shield', label: t('admin_dashboard'), to: '/admin', bg: 'rgba(220,38,38,0.12)', iconColor: '#DC2626', highlight: true }] : []),
    // Core
    { icon: 'car',    label: t('my_vehicles'),       to: '/my-vehicles',     bg: 'rgba(79,123,245,0.12)', iconColor: 'var(--brand)' },
    { icon: 'ticket', label: t('my_bookings'),        to: '/my-reservations', bg: 'rgba(255,159,10,0.12)', iconColor: '#D17B00'      },
    { icon: 'wallet', label: t('wallet'),             to: '/wallet',          bg: 'rgba(52,199,89,0.12)',  iconColor: '#1E9A46'      },
    { icon: 'star',   label: t('rewards_points'),     to: '/loyalty',         bg: 'rgba(255,214,10,0.14)', iconColor: '#A87900'      },
    // Content
    { icon: 'news',     label: t('news'),               to: '/news',          bg: 'rgba(52,199,244,0.12)', iconColor: '#0A8ECC'      },
    { icon: 'building', label: t('partner_for_business'), to: '/partner',     bg: 'rgba(52,199,89,0.12)',  iconColor: '#1E9A46'      },
    // Settings
    { icon: 'settings', label: t('settings'),           to: '/settings',      bg: 'rgba(130,130,160,0.12)', iconColor: '#555577'     },
  ]

  const name = profile?.name || (user ? t('guest_user') : t('guest_user'))
  const sub  = user ? user.email : t('setup_your_profile')

  const handleLogout = async () => {
    try { await logoutUser() } catch { /* ignore */ }
    navigate('/')
  }

  // Group items with a divider before "settings"
  const mainItems     = ITEMS.filter(it => it.icon !== 'settings')
  const settingsItems = ITEMS.filter(it => it.icon === 'settings')

  function MenuRow({ it, last }) {
    return (
      <button
        onClick={() => navigate(it.to)}
        className="press"
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
          borderBottom: !last ? '1px solid var(--bg)' : 'none',
          textAlign: isRTL ? 'right' : 'left',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: R.sm, flexShrink: 0,
          background: it.bg || 'var(--brand-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={it.icon} size={19} color={it.iconColor || 'var(--brand)'} />
        </div>
        <span style={{ flex: 1, fontWeight: it.highlight ? 700 : 600, color: it.highlight ? '#DC2626' : C.black, fontSize: '0.92rem', fontFamily: FONT }}>
          {it.label}
        </span>
        <span style={{ display: 'inline-flex', transform: isRTL ? 'scaleX(-1)' : 'none' }}>
          <Icon name="chevron" size={18} color={C.textMuted} />
        </span>
      </button>
    )
  }

  return (
    <MobileLayout bg={C.grey}>

      {/* Page title */}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: '24px 0 18px', fontFamily: FONT }}>
        {t('profile')}
      </h1>

      {/* ── Profile hero card ───────────────────────────────────────────── */}
      <div className="anim-card" style={{
        background: 'var(--ink)', borderRadius: R.card,
        padding: '20px', color: 'var(--on-ink)',
        boxShadow: SHADOW.card, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blob */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: 'var(--brand)', opacity: 0.25, filter: 'blur(3px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar ring */}
          <div style={{ padding: 3, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), var(--accent))', flexShrink: 0 }}>
            <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="user" size={30} color="var(--brand)" />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', fontFamily: FONT }}>{name}</span>
              {isAdmin && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--brand)', background: 'rgba(79,123,245,0.18)', borderRadius: 99, padding: '2px 8px', letterSpacing: '0.03em' }}>
                  ADMIN
                </span>
              )}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
              {sub}
            </div>
            {profile && (
              <div style={{ display: 'flex', gap: 14, marginTop: 9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, padding: '4px 10px' }}>
                  <Icon name="wallet" size={14} color="var(--brand)" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand)', fontFamily: FONT }}>{profile.walletBalance || 0} LYD</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, padding: '4px 10px' }}>
                  <Icon name="star" size={14} color="#FFD60A" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FFD60A', fontFamily: FONT }}>{profile.points || 0} pts</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(user ? '/setup-profile' : '/login')}
            className="press"
            style={{
              background: 'var(--brand)', border: 'none', borderRadius: R.pill,
              padding: '8px 16px', fontWeight: 700, fontSize: '0.8rem',
              cursor: 'pointer', color: '#fff', fontFamily: FONT, flexShrink: 0,
            }}
          >
            {user ? t('edit') : t('sign_in')}
          </button>
        </div>
      </div>

      {/* ── Main menu ────────────────────────────────────────────────────── */}
      <div className="anim-card" style={{ background: C.white, borderRadius: R.card, marginTop: 18, padding: '4px 18px', boxShadow: SHADOW.soft }}>
        {mainItems.map((it, i) => (
          <MenuRow key={it.to} it={it} last={i === mainItems.length - 1} />
        ))}
      </div>

      {/* ── Settings ─────────────────────────────────────────────────────── */}
      {settingsItems.length > 0 && (
        <div className="anim-card" style={{ background: C.white, borderRadius: R.card, marginTop: 10, padding: '4px 18px', boxShadow: SHADOW.soft }}>
          {settingsItems.map((it, i) => (
            <MenuRow key={it.to} it={it} last={i === settingsItems.length - 1} />
          ))}
        </div>
      )}

      {/* ── Logout ───────────────────────────────────────────────────────── */}
      <button
        onClick={handleLogout}
        className="press"
        style={{
          marginTop: 14, marginBottom: 8, width: '100%', padding: '15px',
          borderRadius: R.pill, border: 'none',
          background: 'rgba(255,59,48,0.08)', color: C.danger,
          fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer', fontFamily: FONT,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <Icon name="logout" size={18} color={C.danger} />
        {t('log_out')}
      </button>

    </MobileLayout>
  )
}
