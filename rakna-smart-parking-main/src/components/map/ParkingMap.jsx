import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { R, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { TRIPOLI_CENTER, PARKING_LOTS, getAvailabilityStatus, STATUS_COLOR, STATUS_LABEL } from '../../utils/constants'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:${color};border:3px solid #fff;
    transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(0,0,0,0.4)">
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
})

export default function ParkingMap({ onSelectLot }) {
  const navigate = useNavigate()
  const { t } = useSettings()

  return (
    <MapContainer
      center={TRIPOLI_CENTER}
      zoom={15}
      style={{ height: '100%', width: '100%', borderRadius: R.card }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {PARKING_LOTS.map((lot) => {
        const status = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
        const color = STATUS_COLOR[status]
        return (
          <Marker key={lot.id} position={[lot.lat, lot.lng]} icon={makeIcon(color)}>
            <Popup>
              <div style={{ minWidth: 180, fontFamily: FONT, direction: 'rtl' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0F224D' }}>{lot.name}</strong>
                <p style={{ margin: '6px 0', color, fontWeight: 600, fontSize: '0.82rem' }}>
                  ● {STATUS_LABEL[status]} — {lot.availableSpots} {t('spots')}
                </p>
                <p style={{ margin: '4px 0', color: '#8A96AC', fontSize: '0.8rem' }}>{lot.address}</p>
                <p style={{ margin: '4px 0', fontWeight: 700, color: '#0F224D' }}>
                  {lot.pricePerHour} د.ل/{t('nav_min') || 'ساعة'}
                </p>
                <button
                  onClick={() => navigate(`/parking/${lot.id}`)}
                  style={{
                    marginTop: 8, width: '100%', padding: '8px',
                    background: '#0F224D', color: '#fff',
                    border: 'none', borderRadius: R.sm,
                    cursor: 'pointer', fontWeight: 700,
                    fontSize: '0.85rem', fontFamily: FONT,
                  }}
                >
                  {t('view_reserve')}
                </button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}