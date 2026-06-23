import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Mascot from './Mascot'
import { RAKNOUSH_MOODS } from '../../utils/raknoushMoods'

export default function RaknoushGallery() {
  const { t, lang } = useSettings()
  return (
    <div style={{ background: C.white, borderRadius: R.card, padding: '16px 0 14px', boxShadow: SHADOW.soft, overflow: 'hidden' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '0 18px 4px' }}>
        {t('meet_raknoush')}
      </h3>
      <p style={{ fontSize: '0.78rem', color: C.textMuted, margin: '0 18px 12px' }}>
        {t('meet_raknoush_sub')}
      </p>
      <div className="tab-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 18px 8px' }}>
        {RAKNOUSH_MOODS.map((m) => (
          <div key={m.mood} style={{ flexShrink: 0, width: 92, textAlign: 'center' }}>
            <div style={{
              background: C.grey, borderRadius: R.card, padding: '6px 0',
              display: 'flex', justifyContent: 'center',
            }}>
              <Mascot size={78} mood={m.mood} />
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: C.black, marginTop: 6 }}>
              {lang === 'ar' ? m.ar : m.en}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
