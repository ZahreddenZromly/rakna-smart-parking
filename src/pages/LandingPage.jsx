import { useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t, speak } = useSettings()
  return (
    <div style={{ minHeight: '100vh', background: C.frame, display: 'flex', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{
        width: '100%', maxWidth: 430, minHeight: '100vh', background: C.ink,
        position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 60px rgba(0,0,0,0.12)',
      }}>
        <div className="blob" style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: '50%', background: C.brand, opacity: 0.55, filter: 'blur(2px)' }} />
        <div className="blob-slow" style={{ position: 'absolute', top: 90, left: -70, width: 180, height: 180, borderRadius: '50%', background: C.accent, opacity: 0.22, filter: 'blur(4px)' }} />
        <div className="blob" style={{ position: 'absolute', bottom: 40, right: -40, width: 120, height: 120, borderRadius: '50%', background: C.accent, opacity: 0.16, filter: 'blur(6px)' }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 32px', position: 'relative', zIndex: 2 }}>
          <div style={{ marginBottom: 8 }}><Mascot size={150} mood="wave" /></div>
          {/* Rukna says hi — tap to hear it */}
          <button onClick={() => speak(t('rukna_intro'))} title={t('tap_me_hint')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', cursor: 'pointer',
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: C.onInk,
            borderRadius: R.pill, padding: '8px 14px', marginBottom: 18, fontSize: '0.86rem', fontWeight: 600,
            animation: 'popIn 0.4s ease',
          }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: C.yellow }} />
            {t('rukna_intro')}
          </button>
          <h1 style={{ color: C.onInk, fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
            {t('splash_title_1')}<br />{t('splash_title_2')}<br /><span style={{ color: C.yellow }}>{t('splash_title_3')}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', marginTop: 18, lineHeight: 1.6 }}>
            {t('splash_sub')}
          </p>
        </div>

        <div style={{ padding: '0 32px 48px', position: 'relative', zIndex: 2 }}>
          <button onClick={() => navigate('/home')} style={{
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
          <button onClick={() => navigate('/partner')} style={{
            width: '100%', marginTop: 14, background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon name="building" size={15} color="rgba(255,255,255,0.7)" /> {t('partner_cta')} →
          </button>
        </div>
      </div>
    </div>
  )
}
