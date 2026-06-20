import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import CarLanes from '../components/parking/CarLanes'
import ConfirmBookingSheet from '../components/parking/ConfirmBookingSheet'
import Icon from '../components/common/Icon'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { PARKING_LOTS } from '../utils/constants'
import { LOT_SPOTS, ZONE_META, ZONE_ORDER } from '../utils/spotsData'

export default function SpotSelectorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, speak } = useSettings()
  const [params] = useSearchParams()
  const lot = PARKING_LOTS.find((l) => l.id === id)
  const layout = LOT_SPOTS[id]

  const zoneParam = params.get('zone')
  const [activeZone, setActiveZone] = useState(
    layout?.zones?.[zoneParam] ? zoneParam : 'taxi'
  )
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [showSheet, setShowSheet] = useState(false)

  if (!lot || !layout) return (
    <MobileLayout bottomNav={false}>
      <TopBar title="Choose Space" />
      <p style={{ textAlign: 'center', color: C.textMuted, marginTop: 40 }}>
        Spot layout for this lot isn't ready yet.
      </p>
    </MobileLayout>
  )

  const zones = ZONE_ORDER.filter((z) => layout.zones[z])
  const zoneSpots = layout.zones[activeZone].spots
  const available = zoneSpots.filter((s) => s.status === 'available').length

  const pickSpot = (spot) => { setSelectedSpot(spot); speak(`${t('selected')} ${spot.id}`) }
  const confirmBooking = (spot) =>
    navigate('/reserve/' + id + '?spot=' + spot.id + '&zone=' + spot.zone)

  return (
    <MobileLayout bottomNav={false} bg={C.white} pad={false}>
      <div style={{ padding: '0 20px' }}>
        <TopBar title={lot.name.replace(' Parking', '').replace(' Lot', '')} />
      </div>

      {/* Zone tabs */}
      <div className="tab-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 20px 8px' }}>
        {zones.map((z) => {
          const active = activeZone === z
          const meta = ZONE_META[z]
          return (
            <button key={z} onClick={() => { setActiveZone(z); setSelectedSpot(null) }} style={{
              padding: '11px 20px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
              background: active ? C.yellow : C.grey, color: active ? C.ink : C.black,
              fontWeight: active ? 700 : 500, fontSize: '0.85rem', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name={meta.iconName} size={18} color={active ? C.ink : C.textSoft} /> {t(meta.key)}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        {/* Step indicator: Choose → Route → Pay */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0 4px' }}>
          {[t('step_choose'), t('step_route'), t('step_pay')].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: i < 2 ? 1 : 'none' }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: '0.7rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? C.yellow : C.greyMid, color: i === 0 ? C.ink : C.textMuted,
              }}>{i + 1}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: i === 0 ? C.black : C.textMuted }}>{s}</span>
              {i < 2 && <span style={{ flex: 1, height: 2, background: C.greyMid, borderRadius: 1 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '12px 0 14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: C.black }}>{t('choose_space_h')}</h3>
          <span style={{ fontSize: '0.82rem', color: C.available, fontWeight: 600 }}>{available} {t('available_count')}</span>
        </div>

        <CarLanes spots={zoneSpots} selectedSpot={selectedSpot} onSelect={pickSpot} />

        {/* Continue button */}
        <button
          onClick={() => selectedSpot && setShowSheet(true)}
          disabled={!selectedSpot}
          style={{
            marginTop: 20, marginBottom: 20, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none',
            background: selectedSpot ? C.yellow : C.greyMid,
            color: selectedSpot ? C.ink : C.textMuted,
            fontWeight: 700, fontSize: '1rem', cursor: selectedSpot ? 'pointer' : 'not-allowed',
            boxShadow: selectedSpot ? SHADOW.yellow : 'none',
          }}
        >
          {selectedSpot ? `${t('continue_with')} ${selectedSpot.id}` : t('select_to_continue')}
        </button>
      </div>

      {showSheet && selectedSpot && (
        <ConfirmBookingSheet
          spot={selectedSpot}
          lot={lot}
          onClose={() => setShowSheet(false)}
          onConfirm={confirmBooking}
        />
      )}
    </MobileLayout>
  )
}
