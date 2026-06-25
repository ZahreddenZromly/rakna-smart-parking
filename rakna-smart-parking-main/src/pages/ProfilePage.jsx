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
    ...(isAdmin ? [{ icon: 'shield', label: t('admin_dashboard'), to: '/admin', highlight: true }] : []),
    { icon: 'car',      label: t('my_vehicles'),        to: '/my-vehicles' },
    { icon: 'ticket',   label: t('my_bookings'),         to: '/my-reservations' },
    { icon: 'wallet',   label: t('wallet'),              to: '/wallet' },
    { icon: 'star',     label: t('rewards_points'),      to: '/loyalty' },
    { icon: 'news',     label: t('news'),                to: '/news' },
    { icon: 'building', label: t('partner_for_business'),to: '/partner' },
    { icon: 'settings', label: t('settings'),            to: '/settings' },
  ]

  const name = profile?.name || t('guest_user')
  const sub  = user ? user.email : t('setup_your_profile')

  const handleLogout = async () => {
    try { await logoutUser() } catch {}
    navigate('/')
  }

  // لو زائر — يعرض إعدادات + زر دخول
  if (!user) return (
    <MobileLayout>
      <div style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.3rem,4vw,1.6rem)', fontWeight: 700, color: C.black, margin: '24px 0 18px', fontFamily: FONT }}>
          {t('profile')}
        </h1>
        {/* بطاقة الزائر */}
        <div style={{
          background: 'var(--brand)', borderRadius: R.card,
          padding: 'clamp(16px,4vw,24px)', color: 'var(--on-ink)',
          boxShadow: SHADOW.card, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18,
        }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="user" size={28} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: FONT }}>{t('guest_user')}</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', fontFamily: FONT }}>{t('setup_your_profile')}</div>
          </div>
          <button onClick={() => navigate('/login')} style={{
            background: '#fff', border: 'none', outline: 'none',
            borderRadius: R.pill, padding: '8px 16px',
            fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
            color: 'var(--brand)', flexShrink: 0, fontFamily: FONT,
          }}>
            {t('sign_in')}
          </button>
        </div>
        {/* إعدادات الزائر */}
        <div style={{ background: C.white, borderRadius: R.card, padding: '6px 18px', boxShadow: SHADOW.soft, marginBottom: 18 }}>
          {[
            { icon: 'settings', label: t('settings'), to: '/settings' },
            { icon: 'news',     label: t('news'),     to: '/news' },
          ].map((it, i, arr) => (
            <button key={it.label} onClick={() => navigate(it.to)} style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              padding: '15px 0', fontFamily: FONT,
              borderBottom: i < arr.length - 1 ? '1px solid var(--border-2)' : 'none',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: R.sm, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={it.icon} size={20} color="var(--brand)" />
              </div>
              <span style={{ flex: 1, fontWeight: 600, color: C.black, fontSize: '0.92rem', textAlign: 'start', fontFamily: FONT }}>{it.label}</span>
              <Icon name="chevron" size={18} color={C.textMuted} />
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  )

  return (
    <MobileLayout>
      <div style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.3rem,4vw,1.6rem)', fontWeight: 700, color: C.black, margin: '24px 0 18px', fontFamily: FONT }}>
          {t('profile')}
        </h1>

        {/* بطاقة المستخدم */}
        <div style={{
          background: 'var(--brand)', borderRadius: R.card,
          padding: 'clamp(16px,4vw,24px)', color: 'var(--on-ink)',
          boxShadow: SHADOW.card, display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="user" size={30} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: FONT }}>{name}</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: FONT }}>{sub}</div>
            {profile && (
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.74rem', color: '#60A5FA', fontWeight: 700 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="wallet" size={14} color="#60A5FA" /> {profile.walletBalance || 0} د.ل
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="star" size={14} color="#60A5FA" /> {profile.points || 0} نقطة
                </span>
              </div>
            )}
          </div>
          <button onClick={() => navigate(user ? '/setup-profile' : '/login')} style={{
            background: '#fff', border: 'none', outline: 'none',
            borderRadius: R.pill, padding: '8px 16px',
            fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
            color: 'var(--brand)', flexShrink: 0, fontFamily: FONT,
          }}>
            {user ? t('edit') : t('sign_in')}
          </button>
        </div>

        {/* قائمة الخيارات */}
        <div className="stagger" style={{
          background: C.white, borderRadius: R.card,
          marginTop: 18, padding: '6px 18px', boxShadow: SHADOW.soft,
        }}>
          {ITEMS.map((it, i) => (
            <button key={it.label} onClick={() => navigate(it.to)} style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              padding: '15px 0', fontFamily: FONT,
              borderBottom: i < ITEMS.length - 1 ? '1px solid var(--border-2)' : 'none',
              textAlign: isRTL ? 'right' : 'left',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: R.sm, flexShrink: 0,
                background: it.highlight ? 'var(--brand)' : 'var(--brand-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={it.icon} size={20} color={it.highlight ? '#fff' : 'var(--brand)'} />
              </div>
              <span style={{ flex: 1, fontWeight: it.highlight ? 700 : 600, color: C.black, fontSize: '0.92rem', fontFamily: FONT }}>
                {it.label}
              </span>
              <Icon name="chevron" size={18} color={C.textMuted} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
            </button>
          ))}
        </div>

        {/* زر تسجيل الخروج */}
        <button onClick={handleLogout} style={{
          marginTop: 18, marginBottom: 24,
          width: '100%', padding: '15px',
          borderRadius: R.pill, outline: 'none',
          border: '1.5px solid var(--error)',
          background: C.white, color: 'var(--error)',
          fontWeight: 600, fontSize: '0.92rem',
          cursor: 'pointer', fontFamily: FONT,
        }}>
          {t('log_out')}
        </button>
      </div>
    </MobileLayout>
  )
}