import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import AdsCarousel from '../components/home/AdsCarousel'
import MascotTip from '../components/common/MascotTip'
import Icon from '../components/common/Icon'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { PARKING_LOTS, getAvailabilityStatus } from '../utils/constants'

const LOT = PARKING_LOTS.find((l) => l.id === '1')
const STATUS_BG  = { available: C.available, limited: C.reserved, full: C.danger }
const STATUS_KEY = { available: 'available', limited: 'filling_up', full: 'full' }

export default function HomePage() {
  const navigate  = useNavigate()
  const { t, lang } = useSettings()
  const { user, profile } = useAuth()

  const st        = getAvailabilityStatus(LOT.availableSpots, LOT.totalSpots)
  const greeting  = lang === 'ar'
    ? `مرحباً${profile?.name ? ' ' + profile.name : ''}،`
    : `Hi${profile?.name ? ' ' + profile.name : ''}!`

  return (
    <MobileLayout>
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>

        {/* تحية */}
        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <div style={{ fontSize: '1rem', color: C.textSoft, fontWeight: 500, fontFamily: FONT }}>
            {greeting}
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 'clamp(1.4rem,4vw,1.8rem)', fontWeight: 700, color: C.black, lineHeight: 1.25, fontFamily: FONT }}>
            {t('find_space')}
          </h1>
        </div>

        {/* كاروسيل الإعلانات */}
        <AdsCarousel />

        {/* نصيحة ركنوش */}
        <MascotTip tips={['tip_1','tip_2','tip_3','tip_4','tip_5']} />

        {/* حالة موقف بورقيبة */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '24px 0 12px', fontFamily: FONT }}>
          {t('location')}
        </h2>
        <div
          onClick={() => navigate('/parking/' + LOT.id)}
          style={{
            background: C.white, borderRadius: R.card,
            padding: 'clamp(14px,3vw,20px)',
            boxShadow: SHADOW.card, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          <div style={{
            width: 50, height: 50, borderRadius: R.md, flexShrink: 0,
            background: 'var(--brand-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="building" size={26} color="var(--brand)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: C.black, fontSize: '1rem', fontFamily: FONT }}>{LOT.name}</div>
            <div style={{ color: C.textMuted, fontSize: '0.8rem', marginTop: 2, fontFamily: FONT }}>{LOT.address}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.available, fontFamily: FONT }}>
                📍 {LOT.availableSpots} {t('spots')} {t('available')}
              </span>
              <span style={{ fontSize: '0.78rem', color: C.textMuted, fontFamily: FONT }}>
                💰 {LOT.pricePerHour} د.ل/س
              </span>
            </div>
          </div>
          <span style={{
            background: STATUS_BG[st] + '22', color: STATUS_BG[st],
            fontWeight: 700, fontSize: '0.68rem',
            padding: '4px 10px', borderRadius: R.pill,
            flexShrink: 0, fontFamily: FONT,
          }}>
            {t(STATUS_KEY[st])}
          </span>
        </div>

        {/* آخر حجز نشط */}
        {user && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '0 0 12px', fontFamily: FONT }}>
              {t('my_bookings')}
            </h2>
            <button
              onClick={() => navigate('/my-reservations')}
              style={{
                width: '100%', padding: '14px 18px',
                background: C.white, borderRadius: R.card,
                border: '1.5px solid var(--border)', outline: 'none',
                boxShadow: SHADOW.soft, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                fontFamily: FONT,
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: R.sm, flexShrink: 0,
                background: 'var(--brand-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="ticket" size={20} color="var(--brand)" />
              </div>
              <span style={{ flex: 1, fontWeight: 600, color: C.black, fontSize: '0.9rem', textAlign: 'start' }}>
                {t('your_reservations')}
              </span>
              <Icon name="chevron" size={18} color={C.textMuted} />
            </button>
          </div>
        )}

        {/* روابط سريعة */}
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '24px 0 12px', fontFamily: FONT }}>
          {lang === 'ar' ? 'وصول سريع' : 'Quick Access'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px,1fr))', gap: 10, marginBottom: 24 }}>
          {[
            { icon: 'map',    label: t('nav_map'),      to: '/map' },
            { icon: 'star',   label: t('nav_rewards'),  to: '/loyalty' },
            { icon: 'wallet', label: t('wallet'),       to: '/wallet' },
            { icon: 'news',   label: t('news'),         to: '/news' },
          ].map((item) => (
            <button key={item.to} onClick={() => navigate(item.to)} style={{
              background: C.white, borderRadius: R.card,
              padding: '16px 8px', border: 'none', outline: 'none',
              boxShadow: SHADOW.soft, cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8, fontFamily: FONT,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: R.md,
                background: 'var(--brand-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={item.icon} size={22} color="var(--brand)" />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: C.black }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}