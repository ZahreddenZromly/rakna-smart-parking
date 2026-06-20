import { useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t } = useSettings()
  return (
    <div style={{ minHeight: '100vh', background: C.frame, display: 'flex', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{
        width: '100%', maxWidth: 430, minHeight: '100vh', background: C.ink,
        position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 60px rgba(0,0,0,0.12)',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: '50%', background: C.yellow, opacity: 0.9 }} />
        <div style={{ position: 'absolute', top: 90, left: -70, width: 160, height: 160, borderRadius: '50%', background: C.yellow, opacity: 0.15 }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px', position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: 16 }}><Icon name="logo" size={72} color={C.yellow} strokeWidth={1.8} /></div>
          <h1 style={{ color: C.onInk, fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
            {t('splash_title_1')}<br />{t('splash_title_2')}<br /><span style={{ color: C.yellow }}>{t('splash_title_3')}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', marginTop: 18, lineHeight: 1.6 }}>
            {t('splash_sub')}
          </p>
        </div>

        <div style={{ padding: '0 32px 48px', position: 'relative', zIndex: 2 }}>
          <button onClick={() => navigate('/map')} style={{
            width: '100%', padding: '18px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
            background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1.05rem', boxShadow: SHADOW.yellow,
          }}>
            {t('get_started')} →
          </button>
          <button onClick={() => navigate('/phone-login')} style={{
            width: '100%', padding: '16px', marginTop: 12, borderRadius: R.pill,
            border: '1.5px solid rgba(255,255,255,0.25)', cursor: 'pointer',
            background: 'transparent', color: C.onInk, fontWeight: 600, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Icon name="phone" size={18} /> {t('login_phone')}
          </button>
        </div>
      </div>
    </div>
  )
}
