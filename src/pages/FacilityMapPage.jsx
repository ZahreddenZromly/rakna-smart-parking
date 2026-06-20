import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import InteractiveLotMap from '../components/parking/InteractiveLotMap'
import ConfirmBookingSheet from '../components/parking/ConfirmBookingSheet'
import Icon from '../components/common/Icon'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { PARKING_LOTS } from '../utils/constants'
import { LOT_SPOTS, ZONE_META, ZONE_ORDER } from '../utils/spotsData'

export default function FacilityMapPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, speak } = useSettings()
  const lot = PARKING_LOTS.find((l) => l.id === id)
  const layout = LOT_SPOTS[id]

  const [view, setView] = useState('interactive') // 'interactive' | 'plan'
  const [zoom, setZoom] = useState(1)
  const [selected, setSelected] = useState(null)
  const [sheet, setSheet] = useState(false)

  if (!lot || !layout) return (
    <MobileLayout bottomNav={false}>
      <TopBar title={t('facility_map')} />
      <p style={{ textAlign: 'center', color: C.textMuted, marginTop: 40 }}>No map available.</p>
    </MobileLayout>
  )

  const pickSpot = (s) => { setSelected(s); speak(`${t('selected')} ${s.id}`); setSheet(true) }
  const confirmBooking = (spot) => navigate(`/reserve/${id}?spot=${spot.id}&zone=${spot.zone}`)
  const zones = ZONE_ORDER.filter((z) => layout.zones[z])

  return (
    <MobileLayout bottomNav={false} bg={C.grey}>
      <TopBar title={t('facility_map')} />

      {/* view toggle */}
      <div style={{ display: 'flex', gap: 6, background: C.white, padding: 5, borderRadius: R.pill, boxShadow: SHADOW.soft, marginBottom: 14 }}>
        {[['interactive', t('map_interactive')], ['plan', t('map_plan')]].map(([k, lbl]) => (
          <button key={k} onClick={() => setView(k)} style={{
            flex: 1, padding: '10px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
            background: view === k ? C.yellow : 'transparent', color: view === k ? C.ink : C.textSoft,
            fontWeight: 700, fontSize: '0.85rem',
          }}>{lbl}</button>
        ))}
      </div>

      {view === 'interactive' ? (
        <div style={{ background: C.white, borderRadius: R.card, padding: 14, boxShadow: SHADOW.soft }}>
          <p style={{ color: C.textMuted, fontSize: '0.82rem', margin: '0 0 10px' }}>{t('tap_spot_book')}</p>
          <InteractiveLotMap layout={layout} selectedSpot={selected} onSelect={pickSpot} t={t} />
        </div>
      ) : (
        <div style={{ background: C.white, borderRadius: R.card, padding: 10, boxShadow: SHADOW.soft }}>
          <div className="no-scrollbar" style={{ overflow: 'auto', borderRadius: R.md, maxHeight: '52vh' }}>
            <img src={layout.facilityMap} alt={t('facility_map')} style={{ width: (100 * zoom) + '%', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
            <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} style={zbtn}>－</button>
            <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: C.textMuted, minWidth: 44, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(4, z + 0.5))} style={zbtn}>＋</button>
          </div>
        </div>
      )}

      {/* zone shortcuts */}
      <p style={{ color: C.textMuted, fontSize: '0.85rem', margin: '16px 4px 10px' }}>{t('tap_zone_book')}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
        {zones.map((z) => {
          const meta = ZONE_META[z]
          const spots = layout.zones[z].spots
          const free = spots.filter((s) => s.status === 'available').length
          return (
            <button key={z} onClick={() => navigate(`/parking/${id}/spots?zone=${z}`)} style={{
              display: 'flex', alignItems: 'center', gap: 12, background: C.white, border: 'none',
              borderRadius: R.card, padding: 14, boxShadow: SHADOW.soft, cursor: 'pointer',
              borderInlineStart: '6px solid ' + meta.color, textAlign: 'start',
            }}>
              <div style={{ width: 42, height: 42, borderRadius: R.sm, background: meta.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={meta.iconName} size={22} color={meta.color} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.black }}>{meta.prefix} · {t(meta.key)}</div>
                <div style={{ fontSize: '0.78rem', color: C.textMuted }}>{spots.length} · <span style={{ color: C.available, fontWeight: 600 }}>{free} {t('free')}</span></div>
              </div>
              <span style={{ background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '0.78rem', padding: '8px 14px', borderRadius: R.pill }}>{t('book_here')}</span>
            </button>
          )
        })}
      </div>

      {sheet && selected && (
        <ConfirmBookingSheet spot={selected} lot={lot} onClose={() => setSheet(false)} onConfirm={confirmBooking} />
      )}
    </MobileLayout>
  )
}

const zbtn = {
  width: 38, height: 38, borderRadius: '50%', border: '1.5px solid ' + C.greyMid,
  background: C.white, color: C.black, fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700,
}
