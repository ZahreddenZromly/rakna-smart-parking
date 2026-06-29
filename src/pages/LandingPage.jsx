import { useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'

export default function LandingPage() {
  const navigate = useNavigate()
  const { t, speak } = useSettings()

  return (
    <div className="landing-shell">
      {/* Global decorative blobs */}
      <div className="blob" style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'var(--brand)', opacity: 0.4, filter: 'blur(3px)', pointerEvents: 'none', zIndex: 1 }} />
      <div className="blob-slow" style={{ position: 'absolute', top: 100, left: -80, width: 200, height: 200, borderRadius: '50%', background: 'var(--accent)', opacity: 0.2, filter: 'blur(5px)', pointerEvents: 'none', zIndex: 1 }} />
      <div className="blob" style={{ position: 'absolute', bottom: 60, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'var(--accent)', opacity: 0.14, filter: 'blur(7px)', pointerEvents: 'none', zIndex: 1 }} />

      <div className="landing-inner">
        {/* Left panel: mascot + hero text */}
        <div className="landing-hero">
          <div style={{ marginBottom: 10 }}>
            <Mascot size={140} mood="wave" />
          </div>

          <button
            onClick={() => speak(t('rukna_intro'))}
            title={t('tap_me_hint')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
              cursor: 'pointer', background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)', color: C.onInk,
              borderRadius: R.pill, padding: '8px 14px', marginBottom: 20,
              fontSize: '0.86rem', fontWeight: 600, fontFamily: FONT,
              animation: 'popIn 0.4s ease',
            }}
          >
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: C.yellow }} />
            {t('rukna_intro')}
          </button>

          <h1 style={{ color: C.onInk, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, margin: 0, fontFamily: FONT }}>
            {t('splash_title_1')}<br />
            {t('splash_title_2')}<br />
            <span style={{ color: C.yellow }}>{t('splash_title_3')}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginTop: 18, lineHeight: 1.65, fontFamily: FONT, maxWidth: 440 }}>
            {t('splash_sub')}
          </p>

          {/* Feature badges — visible on desktop below the description */}
          <div className="show-desk" style={{ display: 'none', gap: 10, marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { icon: 'map',    label: t('onb1_title') },
              { icon: 'star',   label: t('onb3_title') },
              { icon: 'wallet', label: t('onb2_title') },
            ].map(f => (
              <div key={f.icon} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: R.pill, padding: '8px 14px' }}>
                <Icon name={f.icon} size={15} color="var(--brand)" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontFamily: FONT, fontWeight: 600 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: CTA buttons */}
        <div className="landing-cta">
          <button
            onClick={() => navigate('/home')}
            className="press"
            style={{
              width: '100%', padding: '18px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
              background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1.05rem',
              boxShadow: SHADOW.yellow, fontFamily: FONT,
            }}
          >
            {t('get_started')} →
          </button>

          <button
            onClick={() => navigate('/phone-login')}
            style={{
              width: '100%', padding: '16px', marginTop: 12, borderRadius: R.pill,
              border: '1.5px solid rgba(255,255,255,0.25)', cursor: 'pointer',
              background: 'transparent', color: C.onInk, fontWeight: 600, fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: FONT,
            }}
          >
            <Icon name="phone" size={18} color={C.onInk} /> {t('login_phone')}
          </button>

          <button
            onClick={() => navigate('/partner')}
            style={{
              width: '100%', marginTop: 14, background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: FONT,
            }}
          >
            <Icon name="building" size={15} color="rgba(255,255,255,0.7)" /> {t('partner_cta')} →
          </button>
        </div>
      </div>
    </div>
  )
}
