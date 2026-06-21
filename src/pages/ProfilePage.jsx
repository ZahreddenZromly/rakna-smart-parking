import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { logoutUser } from '../firebase/authService'
import Icon from '../components/common/Icon'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { t, isRTL } = useSettings()
  const { user, profile, isAdmin } = useAuth()

  const ITEMS = [
    ...(isAdmin ? [{ icon: 'shield', label: t('admin_dashboard'), to: '/admin', highlight: true }] : []),
    { icon: 'car', label: t('my_vehicles'), to: '/my-vehicles' },
    { icon: 'ticket', label: t('my_bookings'), to: '/my-reservations' },
    { icon: 'wallet', label: t('wallet'), to: '/wallet' },
    { icon: 'star', label: t('rewards_points'), to: '/loyalty' },
    { icon: 'news', label: t('news'), to: '/news' },
    { icon: 'building', label: t('partner_for_business'), to: '/partner' },
    { icon: 'settings', label: t('settings'), to: '/settings' },
  ]

  const name = profile?.name || (user ? t('guest_user') : t('guest_user'))
  const sub = user ? user.email : t('setup_your_profile')

  const handleLogout = async () => {
    try { await logoutUser() } catch { /* ignore */ }
    navigate('/')
  }

  return (
    <MobileLayout bg={C.grey}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.black, margin: '24px 0 18px' }}>{t('profile')}</h1>

      <div style={{ background: C.ink, borderRadius: R.card, padding: 22, color: C.onInk, boxShadow: SHADOW.card, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={32} color={C.ink} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{name}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
          {profile && (
            <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.74rem', color: C.yellow, fontWeight: 700 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="wallet" size={15} color={C.yellow} /> {profile.walletBalance || 0} LYD</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="star" size={15} color={C.yellow} /> {profile.points || 0} pts</span>
            </div>
          )}
        </div>
        <button onClick={() => navigate(user ? '/setup-profile' : '/login')} style={{
          background: C.yellow, border: 'none', borderRadius: R.pill, padding: '8px 16px',
          fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', color: C.ink,
        }}>{user ? t('edit') : t('sign_in')}</button>
      </div>

      <div style={{ background: C.white, borderRadius: R.card, marginTop: 18, padding: '6px 18px', boxShadow: SHADOW.soft }}>
        {ITEMS.map((it, i) => (
          <button key={it.label} onClick={() => navigate(it.to)} style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14, padding: '15px 0',
            borderBottom: i < ITEMS.length - 1 ? '1px solid ' + C.grey : 'none', textAlign: isRTL ? 'right' : 'left',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: R.sm, background: it.highlight ? C.yellow : C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={it.icon} size={20} color={C.ink} /></div>
            <span style={{ flex: 1, fontWeight: it.highlight ? 700 : 600, color: C.black, fontSize: '0.92rem' }}>{it.label}</span>
            <span style={{ color: C.textMuted, display: 'inline-flex', transform: isRTL ? 'scaleX(-1)' : 'none' }}><Icon name="chevron" size={18} color={C.textMuted} /></span>
          </button>
        ))}
      </div>

      <button onClick={handleLogout} style={{
        marginTop: 18, width: '100%', padding: '15px', borderRadius: R.pill,
        border: '1.5px solid ' + C.danger, background: C.white, color: C.danger,
        fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer',
      }}>{t('log_out')}</button>
    </MobileLayout>
  )
}
