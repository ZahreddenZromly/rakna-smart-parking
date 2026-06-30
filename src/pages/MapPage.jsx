import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MobileLayout from '../components/common/MobileLayout'
import AIAssistant from '../components/ai/AIAssistant'
import Icon from '../components/common/Icon'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import {
  TRIPOLI_CENTER, PARKING_LOTS, getAvailabilityStatus,
  getLotName, getLotAddress, getLotShortName,
} from '../utils/constants'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makePinIcon(color, selected) {
  const sz = selected ? 42 : 34
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${sz}px;height:${sz}px;
      border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${color};border:${selected ? 3 : 2}px solid #fff;
      display:flex;align-items:center;justify-content:center;
      box-shadow:${selected
        ? '0 4px 18px rgba(0,0,0,0.45),0 0 0 3px rgba(79,123,245,0.3)'
        : '0 2px 8px rgba(0,0,0,0.28)'};
    "><span style="transform:rotate(45deg);font-weight:800;
      font-size:${selected ? 15 : 12}px;color:#fff;
      font-family:'Tajawal',sans-serif;">P</span></div>`,
    iconSize:   [sz, sz],
    iconAnchor: [sz / 2, sz],
  })
}

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;
    background:#3B82F6;border:3px solid #fff;
    box-shadow:0 0 0 5px rgba(59,130,246,0.25)"></div>`,
  iconSize:   [18, 18],
  iconAnchor: [9, 9],
})

const ST_COLOR = { available: C.available, limited: C.reserved, full: C.occupied }
const ST_TKEY  = { available: 'available',  limited: 'filling_up', full: 'full' }

async function fetchRoute(from, to) {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    const data = await fetch(url).then(r => r.json())
    if (data.routes?.[0]) {
      const r = data.routes[0]
      return { coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]), dist: r.distance, dur: r.duration }
    }
  } catch {}
  return null
}

function FlyTo({ selected, userPos }) {
  const map = useMap()
  useEffect(() => {
    if (!selected) return
    if (userPos) {
      map.fitBounds([[selected.lat, selected.lng], userPos], { padding: [80, 80], maxZoom: 16, animate: true })
    } else {
      map.flyTo([selected.lat, selected.lng], 17, { duration: 0.7 })
    }
  }, [selected?.id, !!userPos])
  return null
}

// Leaflet measures its container once on mount — if the flex layout around it
// hasn't fully settled yet (fonts loading, nested flex reflow), it can measure
// a stale/zero size. Force a re-measure shortly after mount and on resize.
function MapReady() {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    const t = setTimeout(() => map.invalidateSize(), 250)
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize) }
  }, [map])
  return null
}

export default function MapPage() {
  const navigate = useNavigate()
  const { t, lang } = useSettings()
  const ar = lang === 'ar'

  const [selected,  setSelected]  = useState(null)
  const [userPos,   setUserPos]   = useState(null)
  const [route,     setRoute]     = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [locating,  setLocating]  = useState(false)
  const [geoError,  setGeoError]  = useState(false)
  const [search,    setSearch]    = useState('')

  const filtered = search.trim()
    ? PARKING_LOTS.filter(l =>
        getLotName(l, lang).toLowerCase().includes(search.toLowerCase()) ||
        getLotAddress(l, lang).toLowerCase().includes(search.toLowerCase())
      )
    : PARKING_LOTS

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) { setGeoError(true); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setLocating(false); setGeoError(false) },
      () => { setLocating(false); setGeoError(true) },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [])

  useEffect(() => { locateMe() }, [])

  const selectLot = useCallback(async (lot) => {
    setSelected(lot)
    setRoute(null)
    setRouteInfo(null)
    if (userPos) {
      const r = await fetchRoute(userPos, [lot.lat, lot.lng])
      if (r) { setRoute(r.coords); setRouteInfo({ dist: r.dist, dur: r.dur }) }
    }
  }, [userPos])

  useEffect(() => {
    if (selected && userPos && !route) {
      fetchRoute(userPos, [selected.lat, selected.lng])
        .then(r => { if (r) { setRoute(r.coords); setRouteInfo({ dist: r.dist, dur: r.dur }) } })
    }
  }, [userPos])

  const clearSelection = () => { setSelected(null); setRoute(null); setRouteInfo(null) }

  const SearchBar = ({ className = '', style = {} }) => (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.grey, borderRadius: R.pill, padding: '0 14px', height: 40, ...style }}>
      <Icon name="search" size={14} color={C.textMuted} />
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={ar ? 'ابحث عن موقف...' : 'Search parking...'}
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: FONT, fontSize: '0.87rem', color: C.text,
          direction: ar ? 'rtl' : 'ltr',
        }}
      />
      {search && (
        <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.textMuted, padding: 0, fontSize: '1.1rem', lineHeight: 1 }}>×</button>
      )}
    </div>
  )

  return (
    <MobileLayout pad={false} scroll={false}>
      <div className="map-outer">

        {/* ── LEFT PANEL (desktop) / BOTTOM PANEL (mobile) ─── */}
        <div className="map-panel">

          {/* Panel header — desktop only */}
          <div className="show-desk-block" style={{ padding: '16px 14px 10px', borderBottom: `1px solid ${C.greyMid}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  width: 34, height: 34, borderRadius: '50%', border: 'none',
                  background: C.grey, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <Icon name={ar ? 'chevron' : 'back'} size={17} color={C.text} />
              </button>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text, fontFamily: FONT }}>
                {ar ? 'خريطة المواقف' : 'Parking Map'}
              </span>
            </div>
            <SearchBar />
          </div>

          {/* Info card (when lot selected) */}
          {selected && (
            <InfoCard
              lot={selected}
              routeInfo={routeInfo}
              lang={lang}
              t={t}
              onBook={() => navigate('/parking/' + selected.id)}
              onClose={clearSelection}
            />
          )}

          {/* Lot chips / list */}
          <div className="map-chips">
            {filtered.map(lot => {
              const st  = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
              const sel = selected?.id === lot.id
              return (
                <button
                  key={lot.id}
                  onClick={() => selectLot(lot)}
                  className="map-chip"
                  style={{
                    background: sel ? 'var(--brand)' : C.grey,
                    color:      sel ? '#fff' : C.text,
                    boxShadow:  sel ? SHADOW.brand : 'none',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: sel ? 'rgba(255,255,255,0.7)' : ST_COLOR[st],
                    }} />
                    {getLotShortName(lot, lang)}
                  </span>
                  <span style={{ opacity: 0.65, fontSize: '0.72rem', fontWeight: 600 }}>
                    {lot.availableSpots} {ar ? 'متاح' : 'free'}
                  </span>
                </button>
              )
            })}
            {search.trim() && filtered.length === 0 && (
              <span style={{ padding: '9px 4px', fontSize: '0.82rem', color: C.textMuted, fontFamily: FONT, whiteSpace: 'nowrap' }}>
                {ar ? 'لا توجد نتائج' : 'No results'}
              </span>
            )}
          </div>
        </div>

        {/* ── MAP ─── */}
        <div className="map-map">
          <MapContainer
            center={TRIPOLI_CENTER}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OSM</a> &copy; CARTO'
              subdomains="abcd"
              maxZoom={20}
            />
            <FlyTo selected={selected} userPos={userPos} />
            <MapReady />

            {PARKING_LOTS.map(lot => {
              const st  = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
              const hex = st === 'full' ? '#9A9A9A' : st === 'limited' ? '#FF9F0A' : '#4F7BF5'
              const sel = selected?.id === lot.id
              return (
                <Marker
                  key={lot.id}
                  position={[lot.lat, lot.lng]}
                  icon={makePinIcon(hex, sel)}
                  eventHandlers={{ click: () => selectLot(lot) }}
                  zIndexOffset={sel ? 1000 : 0}
                />
              )
            })}

            {userPos && <Marker position={userPos} icon={USER_ICON} />}

            {route && (
              <Polyline
                positions={route}
                pathOptions={{ color: '#4F7BF5', weight: 5, opacity: 0.88, lineCap: 'round', lineJoin: 'round' }}
              />
            )}
          </MapContainer>

          {/* Floating search bar — mobile only */}
          <div className="hide-desk" style={{
            position: 'absolute', top: 12, left: 12, right: 12,
            zIndex: 900, display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: 'rgba(255,255,255,0.96)', boxShadow: SHADOW.soft,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name={ar ? 'chevron' : 'back'} size={19} color={C.text} />
            </button>
            <SearchBar style={{ flex: 1, background: 'rgba(255,255,255,0.96)', boxShadow: SHADOW.soft }} />
          </div>

          {/* Geo error */}
          {geoError && !selected && (
            <div style={{
              position: 'absolute', top: 62, left: '50%', transform: 'translateX(-50%)',
              zIndex: 900, background: 'rgba(255,255,255,0.95)', borderRadius: R.pill,
              padding: '5px 14px', boxShadow: SHADOW.soft, whiteSpace: 'nowrap',
              fontSize: '0.73rem', color: C.textMuted, fontFamily: FONT, animation: 'fadeIn 0.2s ease',
            }}>
              {ar ? '⚠ تعذّر تحديد موقعك' : '⚠ Location unavailable'}
            </div>
          )}

          {/* Directions buttons — shown on map when lot selected */}
          {selected && (() => {
            const directionsUrl = userPos
              ? `https://www.google.com/maps/dir/${userPos[0]},${userPos[1]}/${selected.lat},${selected.lng}`
              : `https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&travelmode=driving`
            const mapsUrl = userPos ? directionsUrl
              : `https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`
            return (
              <>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'absolute', top: 16, left: 12, zIndex: 900,
                    background: 'var(--brand)', borderRadius: R.pill,
                    padding: '9px 16px', boxShadow: SHADOW.brand,
                    display: 'flex', alignItems: 'center', gap: 7,
                    fontFamily: FONT, fontSize: '0.8rem', fontWeight: 700, color: '#fff',
                    textDecoration: 'none', animation: 'popIn 0.2s ease',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l19-9-9 19-2-8-8-2Z"/>
                  </svg>
                  {ar ? 'ابدأ الملاحة' : 'Directions'}
                </a>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'absolute', top: 16, right: 12, zIndex: 900,
                    background: 'rgba(255,255,255,0.96)', borderRadius: R.md,
                    padding: '8px 12px', boxShadow: SHADOW.soft,
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: FONT, fontSize: '0.73rem', fontWeight: 700, color: C.text,
                    textDecoration: 'none', animation: 'popIn 0.2s ease',
                  }}
                >
                  <Icon name="map" size={13} color={C.text} />
                  {ar ? 'قوقل' : 'Maps'}
                </a>
              </>
            )
          })()}

          {/* Locate me button */}
          <button
            onClick={locateMe}
            disabled={locating}
            title={ar ? 'موقعي الحالي' : 'My location'}
            style={{
              position: 'absolute', bottom: 12, right: 12, zIndex: 900,
              width: 42, height: 42, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.96)', boxShadow: SHADOW.float,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {locating
              ? <div style={{ width: 17, height: 17, borderRadius: '50%', border: '2.5px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
              : <Icon name="pin" size={18} color={userPos ? 'var(--brand)' : C.textMuted} />
            }
          </button>
        </div>
      </div>

      <AIAssistant />
    </MobileLayout>
  )
}

function InfoCard({ lot, routeInfo, lang, t, onBook, onClose }) {
  const ar  = lang === 'ar'
  const st  = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
  const fmtDist = d => d < 1000 ? Math.round(d) + (ar ? ' م' : ' m') : (d / 1000).toFixed(1) + ' km'
  const fmtEta  = s => Math.ceil(s / 60) + ' ' + (ar ? 'دق' : 'min')

  return (
    <div style={{
      borderBottom: `1px solid ${C.greyMid}`,
      padding: '14px 16px 12px',
      animation: 'popIn 0.22s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: routeInfo ? 10 : 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: C.text, fontSize: '0.97rem', fontFamily: FONT }}>
              {getLotName(lot, lang)}
            </span>
            <span style={{
              background: ST_COLOR[st] + '22', color: ST_COLOR[st],
              fontSize: '0.62rem', fontWeight: 700, padding: '3px 8px', borderRadius: R.pill, fontFamily: FONT,
            }}>
              {t(ST_TKEY[st])}
            </span>
          </div>
          <div style={{ color: C.textMuted, fontSize: '0.72rem', marginTop: 3, fontFamily: FONT }}>
            {getLotAddress(lot, lang)}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ border: 'none', borderRadius: '50%', background: C.grey, width: 26, height: 26, flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '0.85rem' }}
        >×</button>
      </div>

      {routeInfo && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'center',
          background: 'var(--brand-soft)', borderRadius: R.sm,
          padding: '7px 12px', marginBottom: 12,
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand)', fontFamily: FONT }}>
            🚗 {fmtDist(routeInfo.dist)}
          </span>
          <span style={{ color: C.textMuted }}>·</span>
          <span style={{ fontSize: '0.76rem', color: C.textSoft, fontFamily: FONT }}>
            ≈ {fmtEta(routeInfo.dur)} {ar ? 'بالسيارة' : 'drive'}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, background: C.grey, borderRadius: R.sm, padding: '7px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: C.textMuted, fontFamily: FONT }}>{ar ? 'متاح' : 'Free'}</div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: '0.88rem', fontFamily: FONT }}>{lot.availableSpots}</div>
        </div>
        <div style={{ flex: 1, background: C.grey, borderRadius: R.sm, padding: '7px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.6rem', color: C.textMuted, fontFamily: FONT }}>{ar ? 'السعر' : 'Price'}</div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: '0.88rem', fontFamily: FONT }}>{lot.pricePerHour} LYD</div>
        </div>
        <button
          onClick={onBook}
          style={{
            flex: 2, padding: '13px 10px', borderRadius: R.pill, border: 'none',
            background: 'var(--brand)', color: '#fff',
            fontWeight: 700, fontSize: '0.88rem', fontFamily: FONT,
            cursor: 'pointer', boxShadow: SHADOW.brand,
          }}
        >
          {ar ? 'احجز ←' : 'Book →'}
        </button>
      </div>
    </div>
  )
}
