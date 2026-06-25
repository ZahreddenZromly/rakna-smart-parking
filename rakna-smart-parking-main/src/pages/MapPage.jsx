import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MobileLayout from '../components/common/MobileLayout'
import AIAssistant from '../components/ai/AIAssistant'
import Mascot from '../components/common/Mascot'
import Icon from '../components/common/Icon'
import { C, FONT, R, SHADOW, circleBtn } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { PARKING_LOTS, getAvailabilityStatus } from '../utils/constants'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const LOT = PARKING_LOTS.find((l) => l.id === '1')
const LOT_POS = [LOT.lat, LOT.lng]

const lotIcon = L.divIcon({
  className: '',
  html: `<div style="width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0F224D;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(15,34,77,0.4)"><span style="transform:rotate(45deg);font-weight:800;font-size:16px;color:#fff;font-family:Tajawal,system-ui,sans-serif">P</span></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const STATUS_BG  = { available: C.available, limited: C.reserved, full: C.danger }
const STATUS_KEY = { available: 'available', limited: 'filling_up', full: 'full' }

function FitRoute({ userPos }) {
  const map = useMap()
  useEffect(() => {
    if (userPos) {
      map.fitBounds([userPos, LOT_POS], { padding: [80, 80], maxZoom: 16 })
    } else {
      map.setView(LOT_POS, 17)
    }
  }, [userPos])
  return null
}

async function fetchRoute(from, to) {
  try {
    const url  = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    const data = await fetch(url).then((r) => r.json())
    if (data.routes?.[0]) {
      return {
        coords: data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        dist:   data.routes[0].distance,
        dur:    data.routes[0].duration,
      }
    }
  } catch {}
  return null
}

export default function MapPage() {
  const navigate = useNavigate()
  const { t, lang } = useSettings()
  const [userPos,   setUserPos]   = useState(null)
  const [route,     setRoute]     = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const st = getAvailabilityStatus(LOT.availableSpots, LOT.totalSpots)

  useEffect(() => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const uPos = [pos.coords.latitude, pos.coords.longitude]
        setUserPos(uPos)
        setLoading(false)
        const r = await fetchRoute(uPos, LOT_POS)
        if (r) { setRoute(r.coords); setRouteInfo({ dist: r.dist, dur: r.dur }) }
      },
      () => setLoading(false),
      { timeout: 8000, enableHighAccuracy: true }
    )
  }, [])

  return (
    <MobileLayout pad={false}>
      {/* هيدر فوق الخريطة */}
      

      {/* الخريطة كاملة */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0, height: 'calc(100vh - 64px)' }}>
        <MapContainer
          center={LOT_POS}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
            subdomains="abcd"
            maxZoom={20}
          />
          <FitRoute userPos={userPos} />

          <Marker position={LOT_POS} icon={lotIcon}>
            <Popup>{LOT.name}</Popup>
          </Marker>

          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup>{lang === 'ar' ? 'أنت هنا' : 'You are here'}</Popup>
            </Marker>
          )}

          {route && (
            <Polyline
              positions={route}
              pathOptions={{ color: '#0F224D', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round' }}
            />
          )}
        </MapContainer>

        {/* زر Google Maps */}
        <button
          onClick={() => {
            const url = userPos
              ? `https://www.google.com/maps/dir/${userPos[0]},${userPos[1]}/${LOT.lat},${LOT.lng}`
              : `https://www.google.com/maps/search/?api=1&query=${LOT.lat},${LOT.lng}`
            window.open(url, '_blank')
          }}
          style={{
            position: 'absolute', top: 12, insetInlineStart: 12, zIndex: 1000,
            background: 'white', border: 'none', borderRadius: R.md,
            padding: '7px 12px', boxShadow: SHADOW.soft, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.75rem', fontWeight: 700, color: C.black, fontFamily: FONT,
          }}
        >
          <Icon name="map" size={14} color={C.black} />
          {lang === 'ar' ? 'خرائط قوقل' : 'Google Maps'}
        </button>

        {/* البطاقة overlay */}
        <div style={{
          position: 'absolute',
          bottom: 'clamp(80px, 10vw, 24px)',
          left: 'clamp(10px, 3vw, 20px)',
          right: 'clamp(10px, 3vw, 20px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
        }}>
          {/* ركنوش صغير */}
          <div style={{ flexShrink: 0, marginBottom: 4 }}>
            <Mascot size={48} mood={loading ? 'thinking' : userPos ? 'happy' : 'idle'} />
          </div>

          {/* الكرت */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.96)',
            borderRadius: R.card,
            padding: '10px 12px',
            boxShadow: SHADOW.float,
            backdropFilter: 'blur(10px)',
            maxWidth: 'clamp(240px, 60vw, 420px)',
          }}>
            {/* مسافة + وقت */}
            {routeInfo && (
              <div style={{
                display: 'flex', gap: 8, marginBottom: 8,
                padding: '5px 8px',
                background: 'var(--brand-soft)',
                borderRadius: R.sm,
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand)', fontFamily: FONT }}>
                  🚗 {routeInfo.dist < 1000 ? Math.round(routeInfo.dist) + ' م' : (routeInfo.dist / 1000).toFixed(1) + ' كم'}
                </span>
                <span style={{ fontSize: '0.75rem', color: C.textMuted }}>·</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: C.textSoft, fontFamily: FONT }}>
                  ~{Math.ceil(routeInfo.dur / 60)} {t('nav_min')}
                </span>
              </div>
            )}

            {loading && (
              <div style={{ fontSize: '0.72rem', color: C.textMuted, marginBottom: 6, fontFamily: FONT }}>
                📍 {lang === 'ar' ? 'جاري تحديد موقعك...' : 'Getting location...'}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: C.black, fontSize: '0.88rem', fontFamily: FONT }}>{LOT.name}</div>
                <div style={{ color: C.textMuted, fontSize: '0.7rem', marginTop: 1, fontFamily: FONT }}>{LOT.address}</div>
              </div>
              <span style={{
                background: STATUS_BG[st] + '22', color: STATUS_BG[st],
                fontWeight: 700, fontSize: '0.65rem',
                padding: '3px 8px', borderRadius: R.pill,
                flexShrink: 0, fontFamily: FONT,
              }}>
                {t(STATUS_KEY[st])}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
              <span style={{ flex: 1, background: 'var(--bg)', borderRadius: R.sm, padding: '6px 8px', fontSize: '0.7rem', color: C.black, fontWeight: 700, fontFamily: FONT }}>
                📍 {LOT.availableSpots} {t('spots')}
              </span>
              <span style={{ flex: 1, background: 'var(--bg)', borderRadius: R.sm, padding: '6px 8px', fontSize: '0.7rem', color: C.black, fontWeight: 700, fontFamily: FONT }}>
                💰 {LOT.pricePerHour} د.ل/س
              </span>
            </div>

            <button
              onClick={() => navigate('/parking/' + LOT.id)}
              style={{
                width: '100%', padding: '10px',
                borderRadius: R.pill, border: 'none',
                background: '#0F224D', color: '#FFFFFF',
                fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', fontFamily: FONT,
              }}
            >
              {t('view_reserve')} ←
            </button>
          </div>
        </div>
      </div>

      <AIAssistant />
    </MobileLayout>
  )
}