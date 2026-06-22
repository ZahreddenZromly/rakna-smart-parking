import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { TRIPOLI_CENTER, PARKING_LOTS, getAvailabilityStatus, STATUS_COLOR, STATUS_LABEL, getLotName, getLotAddress } from '../../utils/constants'
import { useSettings } from '../../context/SettingsContext'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const makeIcon = (color) =>
  L.divIcon({
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
  const { lang } = useSettings()
  return (
    <MapContainer
      center={TRIPOLI_CENTER}
      zoom={15}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
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
              <div style={{ minWidth: '180px' }}>
                <strong style={{ fontSize: '1rem' }}>{getLotName(lot, lang)}</strong>
                <p style={{ margin: '6px 0', color }}>
                  ● {STATUS_LABEL[status]} — {lot.availableSpots} spots free
                </p>
                <p style={{ margin: '4px 0', color: '#636e72' }}>{getLotAddress(lot, lang)}</p>
                <p style={{ margin: '4px 0' }}><strong>{lot.pricePerHour} LYD/hr</strong></p>
                <button
                  onClick={() => navigate(`/parking/${lot.id}`)}
                  style={{
                    marginTop: '8px', width: '100%', padding: '8px',
                    background: '#00b894', color: '#fff', border: 'none',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  View & Reserve
                </button>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

