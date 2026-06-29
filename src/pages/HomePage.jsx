import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import AIAssistant from '../components/ai/AIAssistant'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { getAds, getNews } from '../firebase/contentService'
import { PARKING_LOTS, getAvailabilityStatus, getLotShortName } from '../utils/constants'

const ST_COLOR = { available: C.available, limited: C.reserved, full: C.occupied }

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'block', width: 3, height: 16, borderRadius: 99, background: 'var(--brand)', flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text, fontFamily: FONT }}>{title}</span>
      </div>
      {action && (
        <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontWeight: 700, fontSize: '0.78rem', fontFamily: FONT, padding: '4px 0' }}>
          {action}
        </button>
      )}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t, lang } = useSettings()
  const { profile } = useAuth()
  const ar = lang === 'ar'

  const [ads,  setAds]  = useState([])
  const [news, setNews] = useState([])

  useEffect(() => {
    getAds().then(setAds)
    getNews().then(rows => setNews(rows.slice(0, 3)))
  }, [])

  const firstName = profile?.name?.split(' ')[0] || ''
  const greeting  = ar
    ? (firstName ? `أهلاً ${firstName}!` : 'أهلاً بك!')
    : (firstName ? `Hey ${firstName}!`   : 'Welcome back!')

  const quickActions = [
    { icon: 'map',    label: ar ? 'الخريطة'  : 'Map',      to: '/map',             bg: 'rgba(79,123,245,0.12)', iconColor: 'var(--brand)' },
    { icon: 'ticket', label: ar ? 'حجوزاتي'  : 'Bookings', to: '/my-reservations', bg: 'rgba(255,159,10,0.12)', iconColor: '#D17B00'      },
    { icon: 'wallet', label: ar ? 'المحفظة'  : 'Wallet',   to: '/wallet',          bg: 'rgba(52,199,89,0.12)',  iconColor: '#1E9A46'      },
    { icon: 'star',   label: ar ? 'النقاط'   : 'Rewards',  to: '/loyalty',         bg: 'rgba(255,214,10,0.14)', iconColor: '#A87900'      },
  ]

  return (
    <MobileLayout>

      {/* ── Hero greeting ───────────────────────────────────────────────── */}
      <div className="anim-card" style={{
        margin: '18px 0 20px',
        background: 'var(--ink)', borderRadius: R.card,
        padding: '20px 20px 22px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div className="blob" style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'var(--brand)', opacity: 0.35, filter: 'blur(3px)', pointerEvents: 'none' }} />
        <div className="blob-slow" style={{ position: 'absolute', bottom: -24, left: -24, width: 110, height: 110, borderRadius: '50%', background: 'var(--accent)', opacity: 0.18, filter: 'blur(5px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Mascot size={68} mood="wave" />
          <div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontFamily: FONT, letterSpacing: '0.02em' }}>
              {ar ? 'ركنة — وقوف السيارات الذكي' : 'Rakna Smart Parking'}
            </div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', fontFamily: FONT, marginTop: 2, lineHeight: 1.2 }}>
              {greeting}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontFamily: FONT, marginTop: 5 }}>
              {ar ? 'أين تريد أن تركن اليوم؟' : 'Where do you want to park today?'}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/map')}
          className="press"
          style={{
            position: 'relative', zIndex: 1, marginTop: 18, width: '100%', padding: '13px',
            borderRadius: R.pill, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-dark) 100%)',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem', fontFamily: FONT,
            boxShadow: SHADOW.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <Icon name="map" size={17} color="#fff" />
          {ar ? 'ابحث عن موقف' : 'Find Parking'}&nbsp;{ar ? '←' : '→'}
        </button>
      </div>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {quickActions.map(a => (
          <button
            key={a.to}
            onClick={() => navigate(a.to)}
            className="press"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
              padding: '14px 6px', borderRadius: R.md, border: 'none', cursor: 'pointer',
              background: C.white, boxShadow: SHADOW.soft,
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: R.sm, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={a.icon} size={20} color={a.iconColor} />
            </div>
            <span style={{ fontSize: '0.67rem', fontWeight: 700, color: C.textSoft, fontFamily: FONT }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* ── Ads carousel ─────────────────────────────────────────────────── */}
      {ads.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title={ar ? 'العروض الخاصة' : 'Special Offers'} />
          <div
            className="tab-scroll"
            style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}
          >
            {ads.map(ad => (
              <div
                key={ad.id}
                className="press"
                style={{
                  minWidth: 200, flexShrink: 0,
                  background: ad.image ? C.white : (ad.bg || 'var(--brand)'),
                  borderRadius: R.card,
                  boxShadow: SHADOW.soft, position: 'relative', overflow: 'hidden',
                }}
              >
                {ad.image ? (
                  <img src={ad.image} alt={ad.title} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,0,0,0.08)', pointerEvents: 'none' }} />
                )}
                <div style={{ padding: '12px 14px' }}>
                  {!ad.image && <div style={{ fontSize: '2rem', marginBottom: 6 }}>{ad.emoji || '🎉'}</div>}
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: ad.image ? C.text : '#1a1a1a', fontFamily: FONT, lineHeight: 1.25 }}>
                    {ad.title}
                  </div>
                  {ad.subtitle && (
                    <div style={{ fontSize: '0.73rem', color: ad.image ? C.textMuted : 'rgba(0,0,0,0.55)', fontFamily: FONT, marginTop: 3 }}>
                      {ad.subtitle}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Live availability ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <SectionHeader
          title={ar ? 'الأماكن المتاحة الآن' : 'Live Availability'}
          action={ar ? 'الخريطة ←' : 'Map →'}
          onAction={() => navigate('/map')}
        />
        <div className="resp-2 stagger">
          {PARKING_LOTS.map(lot => {
            const st  = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
            const pct = Math.round((lot.availableSpots / lot.totalSpots) * 100)
            const stColor = ST_COLOR[st]
            return (
              <button
                key={lot.id}
                onClick={() => navigate('/parking/' + lot.id)}
                className="press"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: C.white, borderRadius: R.md,
                  padding: '12px 14px',
                  border: 'none', cursor: 'pointer',
                  boxShadow: SHADOW.soft, textAlign: ar ? 'right' : 'left',
                  borderLeft: `3px solid ${stColor}`,
                }}
              >
                {/* Status badge */}
                <div style={{
                  width: 40, height: 40, borderRadius: R.sm, flexShrink: 0,
                  background: stColor + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontWeight: 900, fontSize: '1.05rem', color: stColor }}>P</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: C.text, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getLotShortName(lot, lang)}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: stColor, fontFamily: FONT, flexShrink: 0, marginLeft: 8 }}>
                      {lot.availableSpots} {ar ? 'متاح' : 'free'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 5, borderRadius: 99, background: 'var(--bg)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 99, width: pct + '%', background: stColor, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
                <Icon name="chevron" size={16} color={C.textMuted} style={{ flexShrink: 0, transform: ar ? 'rotate(180deg)' : 'none' }} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── News feed ─────────────────────────────────────────────────────── */}
      {news.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader
            title={ar ? 'الأخبار والتحديثات' : 'News & Updates'}
            action={ar ? 'كل الأخبار ←' : 'All →'}
            onAction={() => navigate('/news')}
          />

          <div className="resp-2 stagger">
            {news.map(n => (
              <button
                key={n.id}
                onClick={() => navigate('/news')}
                className="press"
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  background: C.white, borderRadius: R.md,
                  padding: '14px', border: 'none', cursor: 'pointer',
                  boxShadow: SHADOW.soft, textAlign: ar ? 'right' : 'left',
                }}
              >
                {n.image ? (
                  <img src={n.image} alt="" style={{ width: 54, height: 54, borderRadius: R.sm, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 54, height: 54, borderRadius: R.sm, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>
                    {n.emoji || '📰'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: '0.88rem', fontFamily: FONT, lineHeight: 1.3, marginBottom: 4 }}>
                    {n.title}
                  </div>
                  <div style={{ color: C.textMuted, fontSize: '0.75rem', fontFamily: FONT, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {n.body}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: '0.67rem', color: C.textMuted, fontFamily: FONT }}>{n.date}</span>
                    {n.likes > 0 && (
                      <span style={{ fontSize: '0.67rem', color: C.textMuted, fontFamily: FONT }}>· ⭐ {n.likes}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <AIAssistant />
    </MobileLayout>
  )
}
