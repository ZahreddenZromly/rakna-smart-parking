import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { C, R, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const userIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:50%;background:var(--accent);border:3px solid #fff;box-shadow:0 0 0 3px rgba(59,130,246,0.4)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const lotIcon = L.divIcon({
  className: '',
  html: '<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#0F224D;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
})

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) map.fitBounds(positions, { padding: [60, 60] })
  }, [positions])
  return null
}

export default function DirectionsMap({ lot }) {
  const { t } = useSettings()
  const [userPos, setUserPos] = useState(null)
  const [locError, setLocError] = useState(null)
  const [loading, setLoading] = useState(false)

  const lotPos = [lot.lat, lot.lng]

  const getLocation = () => {
    setLoading(true)
    setLocError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setLoading(false) },
      () => { setLocError('Could not get your location. Please allow location access.'); setLoading(false) },
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
    ? Math.round(Math.sqrt(
        Math.pow((userPos[0] - lot.lat) * 111000, 2) +
        Math.pow((userPos[1] - lot.lng) * 111000 * Math.cos(lot.lat * Math.PI / 180), 2)
      ))
    : null

  const positions = userPos ? [userPos, lotPos] : [lotPos]

  return (
    <div style={{ fontFamily: FONT }}>

      {/* أزرار التحكم */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={getLocation} disabled={loading} style={{
          flex: 1, minWidth: 140,
          padding: '10px 18px',
          background: 'var(--brand)', color: 'var(--on-ink)',
          border: 'none', borderRadius: R.md,
          cursor: loading ? 'wait' : 'pointer',
          fontWeight: 700, fontSize: '0.88rem', fontFamily: FONT,
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.2s',
        }}>
          {loading ? t('loading') : userPos ? 'تحديث موقعي' : t('nav_distance') ? 'أظهر موقعي' : 'Show My Location'}
        </button>
        <button onClick={openGoogleMaps} style={{
          flex: 1, minWidth: 140,
          padding: '10px 18px',
          background: 'var(--success)', color: '#fff',
          border: 'none', borderRadius: R.md,
          cursor: 'pointer', fontWeight: 700,
          fontSize: '0.88rem', fontFamily: FONT,
        }}>
          Open in Google Maps
        </button>
      </div>

      {/* رسالة الخطأ */}
      {locError && (
        <div style={{
          background: 'rgba(209,67,67,0.1)', color: 'var(--error)',
          padding: '10px 14px', borderRadius: R.sm,
          marginBottom: 12, fontSize: '0.85rem',
          border: '1px solid rgba(209,67,67,0.2)',
        }}>
          {locError}
        </div>
      )}

      {/* المسافة */}
      {userPos && dist !== null && (
        <div style={{
          background: 'rgba(47,143,91,0.1)', color: 'var(--success)',
          padding: '10px 14px', borderRadius: R.sm,
          marginBottom: 12, fontSize: '0.88rem', fontWeight: 600,
          border: '1px solid rgba(47,143,91,0.2)',
        }}>
          {t('nav_distance')}: {dist < 1000 ? dist + ' م' : (dist / 1000).toFixed(1) + ' كم'}
        </div>
      )}

      {/* الخريطة */}
      <div style={{
        height: 'clamp(260px, 40vw, 380px)',
        borderRadius: R.card, overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <MapContainer center={lotPos} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="OpenStreetMap contributors"
          />
          <FitBounds positions={positions} />

          <Marker position={lotPos} icon={lotIcon}>
            <Popup><strong>{lot.name}</strong><br />{lot.address}</Popup>
          </Marker>

          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup>أنت هنا</Popup>
            </Marker>
          )}

          {userPos && (
            <Polyline
              positions={[userPos, lotPos]}
              pathOptions={{ color: '#0F224D', weight: 4, dashArray: '10, 8', opacity: 0.8 }}
            />
          )}
        </MapContainer>
      </div>

      <p style={{ fontSize: '0.75rem', color: C.textMuted, marginTop: 8, textAlign: 'center' }}>
        الخط المتقطع يمثل المسافة المباشرة. استخدم Google Maps للتنقل المفصّل.
      </p>
    </div>
  )
}