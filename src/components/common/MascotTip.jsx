import { useState, useEffect } from 'react'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Mascot from './Mascot'

// Rukna + a speech bubble that rotates through helpful tips. Dismissible (remembers per session).
// tips: array of translation keys. rotateMs: how often to cycle.
export default function MascotTip({ tips = ['tip_1', 'tip_2', 'tip_3', 'tip_4'], rotateMs = 6000, storageKey = 'rakna_tip_dismissed', mood = 'idle' }) {
  const { t, speak } = useSettings()
  const [i, setI] = useState(0)
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(storageKey) === '1')

  // Tap Rukna to hear the current tip read aloud and move to the next one
  const tapRukna = () => { speak(t(tips[i])); setI((n) => (n + 1) % tips.length) }

  useEffect(() => {
    if (hidden || tips.length < 2) return
    const id = setInterval(() => setI((n) => (n + 1) % tips.length), rotateMs)
    return () => clearInterval(id)
  }, [hidden, tips.length, rotateMs])

  if (hidden) return null

  const dismiss = () => { setHidden(true); sessionStorage.setItem(storageKey, '1') }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 16 }}>
      <button className="rukna-btn" onClick={tapRukna} title={t('tap_me_hint')} aria-label={t('tap_me_hint')} style={{ flexShrink: 0, width: 56 }}>
        <Mascot size={56} mood={mood} />
      </button>
      <div style={{
        position: 'relative', flex: 1, background: C.white, borderRadius: R.md,
        padding: '12px 36px 12px 14px', boxShadow: SHADOW.soft, animation: 'popIn 0.3s ease',
      }}>
        <div style={{ fontSize: '0.68rem', color: C.yellowDark, fontWeight: 700, marginBottom: 2 }}>{t('tip_label')}</div>
        <div style={{ fontSize: '0.86rem', color: C.black, lineHeight: 1.45 }}>{t(tips[i])}</div>
        <button onClick={dismiss} aria-label="dismiss" style={{
          position: 'absolute', top: 6, insetInlineEnd: 8, width: 22, height: 22, borderRadius: '50%',
          border: 'none', background: C.grey, color: C.textMuted, cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1,
        }}>✕</button>
        {/* dots */}
        {tips.length > 1 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {tips.map((_, n) => (
              <span key={n} style={{ width: n === i ? 14 : 5, height: 5, borderRadius: 3, background: n === i ? C.yellow : C.greyMid, transition: 'all 0.2s' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
