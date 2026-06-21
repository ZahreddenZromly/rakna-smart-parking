import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MobileLayout from '../components/common/MobileLayout'
import AdsCarousel from '../components/home/AdsCarousel'
import AIAssistant from '../components/ai/AIAssistant'
import MascotTip from '../components/common/MascotTip'
import Icon from '../components/common/Icon'
import { C, FONT, R, SHADOW, circleBtn } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { TRIPOLI_CENTER, PARKING_LOTS, getAvailabilityStatus } from '../utils/constants'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const pin = (full) => L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${full ? '#C7CDD4' : 'var(--brand)'};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.35)"><span style="transform:rotate(45deg);font-weight:800;font-size:14px;color:#0F0E0E;font-family:Tajawal,system-ui,sans-serif">P</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

const STATUS_BG = { available: C.available, limited: C.reserved, full: C.occupied }
const STATUS_KEY = { available: 'available', limited: 'filling_up', full: 'full' }

export default function MapPage() {
  const navigate = useNavigate()
  const { t, lang } = useSettings()
  const [selected, setSelected] = useState(PARKING_LOTS[0])

  return (
    <MobileLayout bg={C.grey}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20 }}>
        <button style={circleBtn} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.black} strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: C.textMuted, fontWeight: 500 }}>{t('location')}</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.black }}>{lang === 'ar' ? 'ميدان الشهداء، طرابلس ▾' : "Martyrs' Square, Tripoli ▾"}</div>
        </div>
        <button style={circleBtn} aria-label="Notifications" onClick={() => navigate('/loyalty')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.black} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
        </button>
      </div>

      {/* Greeting */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: '1rem', color: C.textSoft, fontWeight: 500 }}>{t('hi_there')}</div>
        <h1 style={{ margin: '4px 0 0', fontSize: '1.7rem', fontWeight: 700, color: C.black, lineHeight: 1.25 }}>
          {t('find_space')}
        </h1>
      </div>

      {/* Rukna tip */}
      <MascotTip tips={['tip_1', 'tip_2', 'tip_3', 'tip_4', 'tip_5']} />

      {/* Promotions / ads carousel */}
      <AdsCarousel />

      {/* Map */}
      <div style={{ marginTop: 20, height: 280, borderRadius: R.card, overflow: 'hidden', boxShadow: SHADOW.card, position: 'relative', isolation: 'isolate' }}>
        <MapContainer center={TRIPOLI_CENTER} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
            subdomains="abcd"
            maxZoom={20}
          />
          {PARKING_LOTS.map((lot) => {
            const st = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
            return (
              <Marker key={lot.id} position={[lot.lat, lot.lng]} icon={pin(st === 'full')}
                eventHandlers={{ click: () => setSelected(lot) }}>
                <Popup>{lot.name}</Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Horizontal lot chips */}
      <div className="tab-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', marginTop: 16, paddingBottom: 4 }}>
        {PARKING_LOTS.map((lot) => {
          const active = selected.id === lot.id
          return (
            <button key={lot.id} onClick={() => setSelected(lot)} style={{
              padding: '9px 16px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
              background: active ? C.black : C.white, color: active ? C.white : C.black,
              fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap', boxShadow: SHADOW.soft,
            }}>
              {lot.name.replace(' Parking', '').replace(' Lot', '')}
            </button>
          )
        })}
      </div>

      {/* Selected lot card */}
      <SelectedCard lot={selected} onOpen={() => navigate('/parking/' + selected.id)} />

      {/* AI assistant */}
      <AIAssistant />
    </MobileLayout>
  )
}

function SelectedCard({ lot, onOpen }) {
  const { t } = useSettings()
  const st = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
  return (
    <div onClick={onOpen} style={{
      marginTop: 16, background: C.white, borderRadius: R.card, padding: 18,
      boxShadow: SHADOW.card, cursor: 'pointer', animation: 'popIn 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: R.md, background: C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="building" size={28} color={C.ink} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: C.black, fontSize: '1rem' }}>{lot.name}</div>
          <div style={{ color: C.textMuted, fontSize: '0.8rem' }}>{lot.address}</div>
        </div>
        <span style={{ background: STATUS_BG[st] + '22', color: STATUS_BG[st], fontWeight: 700, fontSize: '0.7rem', padding: '5px 10px', borderRadius: R.pill }}>
          {t(STATUS_KEY[st])}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Stat icon="pin" label={t('available')} value={lot.availableSpots + ' ' + t('spots')} />
        <Stat icon="wallet" label={t('pricing')} value={lot.pricePerHour + ' LYD/h'} />
      </div>

      <button onClick={(e) => { e.stopPropagation(); onOpen() }} style={{
        marginTop: 16, width: '100%', padding: '14px', borderRadius: R.pill, border: 'none',
        background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: SHADOW.yellow,
      }}>
        {t('view_reserve')}
      </button>
    </div>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div style={{ flex: 1, background: C.grey, borderRadius: R.md, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={18} color={C.textSoft} />
        <div>
          <div style={{ fontSize: '0.68rem', color: C.textMuted }}>{label}</div>
          <div style={{ fontWeight: 700, color: C.black, fontSize: '0.85rem' }}>{value}</div>
        </div>
      </div>
    </div>
  )
}
