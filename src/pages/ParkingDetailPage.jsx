import { useParams, useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import { PARKING_LOTS, getAvailabilityStatus } from '../utils/constants'

const STATUS_BG = { available: C.available, limited: C.reserved, full: C.occupied }
const STATUS_KEY = { available: 'available', limited: 'filling_up', full: 'full' }

export default function ParkingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useSettings()
  const lot = PARKING_LOTS.find((l) => l.id === id)

  if (!lot) return (
    <MobileLayout bottomNav={false}>
      <TopBar title="—" />
      <p style={{ textAlign: 'center', color: C.textMuted, marginTop: 40 }}>Parking lot not found.</p>
    </MobileLayout>
  )

  const st = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
  const pct = Math.round(((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100)

  return (
    <MobileLayout bottomNav={false} bg={C.grey}>
      <TopBar title={t('parking_details')} />

      {/* Hero card */}
      <div style={{ background: C.ink, borderRadius: R.card, padding: 22, color: C.onInk, boxShadow: SHADOW.card }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: 60, height: 60, borderRadius: R.md, background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="building" size={30} color={C.ink} /></div>
          <span style={{ background: STATUS_BG[st] + '33', color: STATUS_BG[st], fontWeight: 700, fontSize: '0.72rem', padding: '6px 12px', borderRadius: R.pill }}>
            {t(STATUS_KEY[st])}
          </span>
        </div>
        <h2 style={{ margin: '16px 0 4px', fontSize: '1.35rem', fontWeight: 700 }}>{lot.name}</h2>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="pin" size={14} color="rgba(255,255,255,0.6)" /> {lot.address}</div>

        {/* Occupancy bar */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{lot.availableSpots} {t('free_of')} {lot.totalSpots}</span>
            <span style={{ fontWeight: 700, color: C.yellow }}>{pct}{t('pct_full')}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: R.pill, height: 8 }}>
            <div style={{ width: pct + '%', background: C.yellow, borderRadius: R.pill, height: '100%' }} />
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        {[
          { icon: 'wallet', label: t('price'), value: lot.pricePerHour + ' LYD/hr' },
          { icon: 'building', label: t('type'), value: lot.type },
          { icon: 'clock', label: t('hours'), value: lot.open24h ? t('open_24h') : t('daytime') },
          { icon: 'shield', label: t('features'), value: lot.features.join(', ') },
        ].map((it) => (
          <div key={it.label} style={{ background: C.white, borderRadius: R.md, padding: 16, boxShadow: SHADOW.soft }}>
            <Icon name={it.icon} size={22} color={C.black} />
            <div style={{ fontSize: '0.7rem', color: C.textMuted, marginTop: 6 }}>{it.label}</div>
            <div style={{ fontWeight: 700, color: C.black, fontSize: '0.85rem' }}>{it.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <button onClick={() => navigate('/parking/' + lot.id + '/spots')} style={{
        marginTop: 20, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none',
        background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: SHADOW.yellow,
      }}>
        {t('choose_space')} →
      </button>
      <button onClick={() => navigate('/parking/' + lot.id + '/map')} style={{
        marginTop: 12, marginBottom: 24, width: '100%', padding: '15px', borderRadius: R.pill,
        border: '1.5px solid ' + C.greyMid, background: C.white, color: C.black, fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Icon name="map" size={18} /> {t('view_facility_map')}
      </button>
    </MobileLayout>
  )
}
