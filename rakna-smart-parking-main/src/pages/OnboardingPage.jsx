import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'

export const markOnboarded = () => localStorage.setItem('rakna_onboarded', '1')
export const hasOnboarded  = () => localStorage.getItem('rakna_onboarded') === '1'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { t, isRTL, speak } = useSettings()
  const [i, setI] = useState(0)

  const slides = [
    { logo: true,   icon: 'logo', title: t('onb1_title'), desc: t('onb1_desc'), say: t('onb1_say'), bg: 'var(--brand)', mood: 'wave'  },
    { icon: 'map',  title: t('onb2_title'), desc: t('onb2_desc'), say: t('onb2_say'), bg: '#A55EEA', mood: 'idle'  },
    { icon: 'star', title: t('onb3_title'), desc: t('onb3_desc'), say: t('onb3_say'), bg: '#2F8F5B', mood: 'happy' },
    { icon: 'logo', title: t('onb4_title'), desc: t('onb4_desc'), say: t('onb4_say'), bg: 'var(--brand)', mood: 'wave' },
  ]

  useEffect(() => { speak(slides[i].say) }, [i]) // eslint-disable-line
  const finish = () => { markOnboarded(); navigate('/') }
  const next   = () => (i < slides.length - 1 ? setI(i + 1) : finish())
  const s = slides[i]

  const Bubble = ({ center = false }) => (
    <button onClick={() => speak(s.say)} title={t('tap_me_hint')} style={{
      position: 'relative',
      alignSelf: center ? 'center' : 'flex-start',
      background: 'var(--brand)', color: 'var(--on-ink)',
      border: 'none', outline: 'none', cursor: 'pointer',
      borderRadius: R.md, padding: '11px 16px', marginBottom: 22,
      maxWidth: 320, textAlign: center ? 'center' : 'start',
      boxShadow: SHADOW.soft, animation: 'popIn 0.3s ease', fontFamily: FONT,
    }}>
      <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#60A5FA', marginBottom: 2 }}>{t('tip_label')}</div>
      <div style={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.45 }}>{s.say}</div>
      <span style={{ position: 'absolute', top: -6, insetInlineStart: 28, width: 14, height: 14, background: 'var(--brand)', transform: 'rotate(45deg)' }} />
    </button>
  )

  const Dots = ({ center = false }) => (
    <div style={{ display: 'flex', gap: 8, marginBottom: 28, justifyContent: center ? 'center' : 'flex-start' }}>
      {slides.map((_, n) => (
        <div key={n} style={{
          width: n === i ? 26 : 8, height: 8, borderRadius: 4,
          background: n === i ? 'var(--brand)' : C.greyMid,
          transition: 'all 0.25s',
        }} />
      ))}
    </div>
  )

  const NextBtn = () => (
    <button onClick={next} style={{
      width: '100%', padding: '18px', borderRadius: R.pill,
      border: 'none', outline: 'none', cursor: 'pointer',
      background: 'var(--brand)', color: 'var(--on-ink)',
      fontWeight: 700, fontSize: '1.05rem',
      boxShadow: SHADOW.brand, fontFamily: FONT,
    }}>
      {i < slides.length - 1 ? t('next') : t('start_now')} {isRTL ? '←' : '→'}
    </button>
  )

  const SkipBtn = () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button onClick={finish} style={{
        background: 'none', border: 'none', outline: 'none',
        color: C.textMuted, fontWeight: 600, cursor: 'pointer',
        fontSize: '0.92rem', fontFamily: FONT,
      }}>{t('skip')}</button>
    </div>
  )

  return (
    <>
      <style>{`
        .onb-mobile  { display: flex; }
        .onb-desktop { display: none; }
        @media (min-width: 1024px) {
          .onb-mobile  { display: none; }
          .onb-desktop { display: flex; }
        }
      `}</style>

      {/* ═══ موبايل + تابلت (< 1024px) ═══ */}
      <div className="onb-mobile" style={{
        minHeight: '100vh', background: C.white,
        justifyContent: 'center', fontFamily: FONT,
      }}>
        <div style={{
          width: '100%', minHeight: '100vh',
          background: C.white, display: 'flex', flexDirection: 'column',
          boxShadow: '0 0 60px rgba(0,0,0,0.10)',
        }}>
          <div style={{ padding: '18px 22px' }}><SkipBtn /></div>

          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '0 clamp(24px,6vw,48px)', textAlign: 'center',
          }}>
            {/* دائرة */}
            <div style={{
              position: 'relative',
              width: 'clamp(160px,45vw,220px)', height: 'clamp(160px,45vw,220px)',
              borderRadius: '50%', background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 40, boxShadow: SHADOW.card, transition: 'background 0.3s',
            }}>
              {s.logo ? (
                <img src="/logo-light.png" alt="ركنة" style={{ width: '65%', height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              ) : (
                <Mascot size={Math.min(160, window.innerWidth * 0.35)} mood={s.mood} />
              )}
              <div style={{
                position: 'absolute', bottom: 4, insetInlineEnd: 4,
                width: 'clamp(44px,12vw,56px)', height: 'clamp(44px,12vw,56px)',
                borderRadius: '50%', background: C.white, boxShadow: SHADOW.soft,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={s.icon} size={24} color="var(--brand)" />
              </div>
            </div>

            <Bubble />
            <h1 style={{ fontSize: 'clamp(1.5rem,5vw,2rem)', fontWeight: 800, color: C.black, margin: '0 0 14px', fontFamily: FONT }}>{s.title}</h1>
            <p style={{ color: C.textSoft, fontSize: 'clamp(0.9rem,2.5vw,1.05rem)', lineHeight: 1.6, margin: 0, fontFamily: FONT }}>{s.desc}</p>
          </div>

          <div style={{ padding: '0 clamp(24px,6vw,48px) 44px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Dots center /></div>
            <NextBtn />
          </div>
        </div>
      </div>

      {/* ═══ ديسكتوب (≥ 1024px) ═══ */}
      <div className="onb-desktop" style={{
        minHeight: '100vh', background: 'var(--bg)',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(32px,4vw,64px)', fontFamily: FONT,
      }}>
        <div style={{
          width: '100%', maxWidth: 960,
          background: C.white, borderRadius: 28, overflow: 'hidden',
          display: 'flex', flexDirection: 'row',
          boxShadow: '0 24px 60px rgba(0,0,0,0.12)',
          minHeight: 560,
        }}>
          {/* يمين — خلفية ملونة */}
          <div style={{
            width: '45%', background: s.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 56, transition: 'background 0.3s',
          }}>
            {/* دائرة بـ ring أبيض واضح */}
            <div style={{
              position: 'relative', width: 220, height: 220, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '4px solid rgba(255,255,255,0.55)',
              boxShadow: '0 0 0 16px rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {s.logo ? (
                <img src="/logo-light.png" alt="ركنة" style={{ width: '62%', height: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              ) : (
                <Mascot size={160} mood={s.mood} />
              )}
              {/* badge ثابت في مكانه */}
              <div style={{
                position: 'absolute', bottom: -10, insetInlineEnd: -10,
                width: 52, height: 52, borderRadius: '50%',
                background: C.white, boxShadow: SHADOW.card,
                border: '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={s.icon} size={24} color="var(--brand)" />
              </div>
            </div>
          </div>

          {/* يسار — نص */}
          <div style={{ width: '55%', display: 'flex', flexDirection: 'column', padding: 52 }}>
            <SkipBtn />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <Bubble center />
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: C.black, margin: '0 0 14px', fontFamily: FONT }}>{s.title}</h1>
              <p style={{ color: C.textSoft, fontSize: '1rem', lineHeight: 1.65, margin: 0, maxWidth: 340, fontFamily: FONT }}>{s.desc}</p>
            </div>
            <div>
              <Dots center />
              <NextBtn />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}