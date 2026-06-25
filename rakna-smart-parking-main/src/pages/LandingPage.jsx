import { useNavigate } from 'react-router-dom'
import { C, FONT, R } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t, speak } = useSettings()

  const blobs = (
    <>
      <div className="blob" style={{ position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: '50%', background: C.accent, opacity: 0.45, filter: 'blur(2px)' }} />
      <div className="blob-slow" style={{ position: 'absolute', top: 90, left: -70, width: 200, height: 200, borderRadius: '50%', background: C.accent, opacity: 0.18, filter: 'blur(4px)' }} />
      <div className="blob" style={{ position: 'absolute', bottom: 40, right: -40, width: 140, height: 140, borderRadius: '50%', background: C.brand, opacity: 0.13, filter: 'blur(6px)' }} />
    </>
  )

  return (
    <>
      <style>{`
        .land-align-start  { text-align: start; align-items: flex-start; }
        .land-align-center { text-align: center; align-items: center; }
        .land-btn-align-start  { align-self: flex-start; }
        .land-btn-align-center { align-self: center; }

        /* موبايل — يسار */
        .land-inner { align-items: flex-start; text-align: start; }
        .land-rukna-btn { align-self: flex-start; }

        /* تابلت (640-1023px) — وسط */
        @media (min-width: 640px) {
          .land-inner { align-items: center; text-align: center; }
          .land-rukna-btn { align-self: center; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh', background: C.ink,
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT,
      }}>
        {blobs}

        {/* المحتوى — في المنتصف دائماً */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 2,
          padding: 'clamp(32px,6vw,64px)',
        }}>
          <div className="land-inner" style={{
            display: 'flex', flexDirection: 'column',
            width: '100%', maxWidth: 560,
          }}>
            {/* ركنوش */}
            <Mascot size={clampSize()} mood="wave" />

            {/* زر الكلام */}
            <button
              onClick={() => speak(t('rukna_intro'))}
              title={t('tap_me_hint')}
              className="land-rukna-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)', color: C.onInk,
                borderRadius: R.pill, padding: '8px 14px',
                marginTop: 12, marginBottom: 20,
                fontSize: 'clamp(0.78rem,2vw,0.9rem)', fontWeight: 600, fontFamily: FONT,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60A5FA', flexShrink: 0 }} />
              {t('rukna_intro')}
            </button>

            {/* العنوان */}
            <h1 style={{
              color: C.onInk, fontWeight: 800,
              fontSize: 'clamp(1.9rem,5vw,3rem)',
              lineHeight: 1.2, margin: '0 0 16px', fontFamily: FONT,
            }}>
              {t('splash_title_1')} {t('splash_title_2')}{' '}
              <span style={{ color: '#60A5FA' }}>{t('splash_title_3')}</span>
            </h1>

            {/* الوصف */}
            <p style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 'clamp(0.9rem,2vw,1.05rem)',
              lineHeight: 1.7, margin: '0 0 32px',
            }}>
              {t('splash_sub')}
            </p>

            {/* الأزرار */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <button onClick={() => navigate('/map')} style={{
                width: '100%', padding: '17px', borderRadius: R.pill,
                border: 'none', cursor: 'pointer',
                background: '#FFFFFF', color: '#0F224D',
                fontWeight: 800, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
                boxShadow: '0 8px 24px rgba(255,255,255,0.18)', fontFamily: FONT,
              }}>
                {t('get_started')} ←
              </button>

              <button onClick={() => navigate('/phone-login')} style={{
                width: '100%', padding: '15px', borderRadius: R.pill,
                border: '1.5px solid rgba(255,255,255,0.25)',
                cursor: 'pointer', background: 'transparent', color: C.onInk,
                fontWeight: 600, fontSize: 'clamp(0.88rem,2vw,0.95rem)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: FONT,
              }}>
                <Icon name="phone" size={18} color={C.onInk} />
                {t('login_phone')}
              </button>

              <button onClick={() => navigate('/partner')} style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)', fontWeight: 600,
                fontSize: 'clamp(0.8rem,2vw,0.87rem)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontFamily: FONT,
              }}>
                <Icon name="building" size={15} color="rgba(255,255,255,0.6)" />
                {t('partner_cta')} ←
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function clampSize() {
  if (typeof window === 'undefined') return 150
  const w = window.innerWidth
  if (w < 640) return 140
  if (w < 1024) return 160
  return 180
}