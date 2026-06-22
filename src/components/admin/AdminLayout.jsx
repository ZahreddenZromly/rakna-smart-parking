import { useNavigate, useLocation } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/authService'
import Icon from '../common/Icon'

const TABS = [
  { to: '/admin', key: 'a_overview', icon: 'settings' },
  { to: '/admin/users', key: 'a_users', icon: 'user' },
  { to: '/admin/content', key: 'a_content', icon: 'news' },
  { to: '/admin/parkings', key: 'a_parkings', icon: 'pin' },
  { to: '/admin/revenue', key: 'a_revenue', icon: 'wallet' },
  { to: '/admin/queue', key: 'a_queue', icon: 'clock' },
  { to: '/admin/partners', key: 'a_partners', icon: 'building' },
  { to: '/admin/analytics', key: 'a_analytics', icon: 'star' },
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useSettings()
  const { loading, isAdmin } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, background: C.grey, color: C.text }}>{t('loading')}</div>
  )

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FONT, background: C.grey, color: C.text }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <p style={{ color: C.textMuted }}>Admins only.</p>
      <button onClick={() => navigate('/map')} style={{ background: C.yellow, color: C.ink, border: 'none', padding: '12px 24px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer' }}>{t('back_to_app')}</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.grey, fontFamily: FONT, color: C.text }}>
      {/* Top bar */}
      <div style={{ background: C.ink, color: C.onInk, padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="logo" size={22} color={C.yellow} /> {t('admin_panel')}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/map')} style={{ background: 'rgba(255,255,255,0.12)', color: C.onInk, border: 'none', padding: '8px 14px', borderRadius: R.pill, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>{t('back_to_app')}</button>
          <button onClick={async () => { try { await logoutUser() } catch { /* ignore */ } navigate('/') }} style={{ background: C.yellow, color: C.ink, border: 'none', padding: '8px 14px', borderRadius: R.pill, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>{t('log_out')}</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '14px 20px 4px', maxWidth: 1100, margin: '0 auto' }}>
        {TABS.map((tab) => {
          const active = location.pathname === tab.to
          return (
            <button key={tab.to} onClick={() => navigate(tab.to)} style={{
              padding: '10px 18px', borderRadius: R.pill, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: active ? C.yellow : C.white, color: active ? C.ink : C.textSoft,
              fontWeight: active ? 700 : 600, fontSize: '0.85rem', boxShadow: SHADOW.soft,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name={tab.icon} size={16} color={active ? C.ink : C.textSoft} /> {t(tab.key)}
            </button>
          )
        })}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px 40px' }}>
        {children}
      </div>
    </div>
  )
}
