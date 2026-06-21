import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'

export const markOnboarded = () => localStorage.setItem('rakna_onboarded', '1')
export const hasOnboarded = () => localStorage.getItem('rakna_onboarded') === '1'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { t, isRTL, speak } = useSettings()
  const [i, setI] = useState(0)

  const slides = [
    { icon: 'map', title: t('onb1_title'), desc: t('onb1_desc'), bg: '#F9DD4E' },
    { icon: 'logo', title: t('onb2_title'), desc: t('onb2_desc'), bg: '#A55EEA' },
    { icon: 'star', title: t('onb3_title'), desc: t('onb3_desc'), bg: '#26DE81' },
  ]

  useEffect(() => { speak(slides[i].title) }, [i])

  const finish = () => { markOnboarded(); navigate('/') }
  const next = () => (i < slides.length - 1 ? setI(i + 1) : finish())

  const s = slides[i]

  return (
    <div style={{ minHeight: '100vh', background: C.frame, display: 'flex', justifyContent: 'center', fontFamily: FONT }}>
      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', background: C.white, display: 'flex', flexDirection: 'column', boxShadow: '0 0 60px rgba(0,0,0,0.12)' }}>

        {/* Skip */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '18px 22px' }}>
          <button onClick={finish} style={{ background: 'none', border: 'none', color: C.textMuted, fontWeight: 600, cursor: 'pointer', fontSize: '0.92rem' }}>
            {t('skip')}
          </button>
        </div>

        {/* Illustration */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div style={{
            position: 'relative', width: 200, height: 200, borderRadius: '50%', background: s.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 40, boxShadow: SHADOW.card, transition: 'background 0.3s',
          }}>
            <Mascot size={150} mood={i === 0 ? 'wave' : 'idle'} />
            {/* slide topic badge */}
            <div style={{
              position: 'absolute', bottom: 6, insetInlineEnd: 6, width: 54, height: 54, borderRadius: '50%',
              background: C.white, boxShadow: SHADOW.soft, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={s.icon} size={28} color={C.ink} />
            </div>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: C.black, margin: '0 0 14px' }}>{s.title}</h1>
          <p style={{ color: C.textSoft, fontSize: '1.02rem', lineHeight: 1.6, margin: 0, maxWidth: 320 }}>{s.desc}</p>
        </div>

        {/* Dots + button */}
        <div style={{ padding: '0 32px 44px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {slides.map((_, n) => (
              <div key={n} style={{
                width: n === i ? 26 : 8, height: 8, borderRadius: 4,
                background: n === i ? C.black : C.greyMid, transition: 'all 0.25s',
              }} />
            ))}
          </div>
          <button onClick={next} style={{
            width: '100%', padding: '18px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
            background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1.05rem', boxShadow: SHADOW.yellow,
          }}>
            {i < slides.length - 1 ? t('next') : t('start_now')} {isRTL ? '←' : '→'}
          </button>
        </div>
      </div>
    </div>
  )
}
