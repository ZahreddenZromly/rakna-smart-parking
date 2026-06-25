import { useEffect } from 'react'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Mascot from './Mascot'

// Compact Rukna greeting banner for dashboards (admin / operator).
// Speaks the greeting once on mount (when voice guidance is on) and again when tapped.
export default function MascotWelcome({ text }) {
  const { t, speak } = useSettings()

  // announce on arrival (re-announce only when the text changes)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak(text) }, [text])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, background: C.white,
      borderRadius: R.card, padding: '12px 16px', boxShadow: SHADOW.soft, marginBottom: 18,
    }}>
      <button className="rukna-btn" onClick={() => speak(text)} title={t('tap_me_hint')} aria-label={t('tap_me_hint')} style={{ flexShrink: 0, width: 52 }}>
        <Mascot size={52} mood="wave" />
      </button>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.yellowDark }}>{t('tip_label')}</div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: C.black, lineHeight: 1.4 }}>{text}</div>
      </div>
    </div>
  )
}
