import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#0984e3;border:3px solid #fff;box-shadow:0 0 0 3px #0984e3aa"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const lotIcon = L.divIcon({
  className: '',
  html: '<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#00b894;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions, { padding: [60, 60] })
    }
  }, [positions])
  return null
}

export default function DirectionsMap({ lot }) {
  const [userPos, setUserPos] = useState(null)
  const [locError, setLocError] = useState(null)
  const [loading, setLoading] = useState(false)

  const lotPos = [lot.lat, lot.lng]

  const getLocation = () => {
    setLoading(true)
    setLocError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude])
        setLoading(false)
      },
      () => {
        setLocError('Could not get your location. Please allow location access.')
        setLoading(false)
      },
      { timeout: 8000 }
    )
  }

  const openGoogleMaps = () => {
    const url = userPos
      ? `https://www.google.com/maps/dir/${userPos[0]},${userPos[1]}/${lot.lat},${lot.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${lot.lat},${lot.lng}`
    window.open(url, '_blank')
  }

  const dist = userPos
    ? Math.round(
        Math.sqrt(
          Math.pow((userPos[0] - lot.lat) * 111000, 2) +
          Math.pow((userPos[1] - lot.lng) * 111000 * Math.cos(lot.lat * Math.PI / 180), 2)
        )
      )
    : null

  const positions = userPos ? [userPos, lotPos] : [lotPos]

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={getLocation} disabled={loading} style={{
          padding: '10px 18px', background: '#0984e3', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem',
        }}>
          {loading ? 'Getting location...' : userPos ? 'Update My Location' : 'Show My Location'}
        </button>
        <button onClick={openGoogleMaps} style={{
          padding: '10px 18px', background: '#00b894', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
        }}>
          Open in Google Maps
        </button>
      </div>

      {locError && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.88rem' }}>
          {locError}
        </div>
      )}

      {userPos && dist !== null && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
          You are approximately {dist < 1000 ? dist + ' m' : (dist / 1000).toFixed(1) + ' km'} from this parking lot.
        </div>
      )}

      {/* Map */}
      <div style={{ height: '340px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <MapContainer center={lotPos} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="OpenStreetMap contributors"
          />
          <FitBounds positions={positions} />

          {/* Parking lot marker */}
          <Marker position={lotPos} icon={lotIcon}>
            <Popup>
              <strong>{lot.name}</strong><br />
              {lot.address}
            </Popup>
          </Marker>

          {/* User marker */}
          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Route line */}
          {userPos && (
            <Polyline
              positions={[userPos, lotPos]}
              pathOptions={{ color: '#0984e3', weight: 4, dashArray: '10, 8', opacity: 0.8 }}
            />
          )}
        </MapContainer>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#b2bec3', marginTop: '8px', textAlign: 'center' }}>
        Dashed line shows straight-line distance. Use Google Maps for turn-by-turn navigation.
      </p>
    </div>
  )
}
