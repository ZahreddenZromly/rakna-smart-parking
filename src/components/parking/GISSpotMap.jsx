import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useSettings } from '../../context/SettingsContext'
import { C } from '../../styles/theme'

const ZONE_HUE = {
  taxi:        '#F2A900',
  reservation: '#A55EEA',
  regular:     '#2BCBBA',
  bus:         '#6C5CE7',
  disability:  '#0984E3',
}

// Parking-bay rectangle icon — looks like a real empty space viewed from above
const bayIcon = (color, selected) => L.divIcon({
  className: '',
  html: `<svg width="16" height="26" viewBox="0 0 16 26" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="14" height="24" rx="3"
      fill="${color}"
      fill-opacity="${selected ? 1 : 0.92}"
      stroke="${selected ? '#1d6ef5' : 'rgba(255,255,255,0.85)'}"
      stroke-width="${selected ? 2.5 : 1.5}"
    />
    ${selected
      ? '<rect x="3.5" y="3.5" width="9" height="19" rx="1.5" fill="none" stroke="rgba(29,110,245,0.5)" stroke-width="1.2"/>'
      : '<line x1="8" y1="5" x2="8" y2="21" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-dasharray="2 2"/>'
    }
  </svg>`,
  iconSize: [16, 26],
  iconAnchor: [8, 13],
  tooltipAnchor: [0, -15],
})

// Faint context bay for OTHER zones (available only, greyed out)
const dimBayIcon = () => L.divIcon({
  className: '',
  html: `<svg width="12" height="20" viewBox="0 0 12 20" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="10" height="18" rx="2"
      fill="rgba(255,255,255,0.18)"
      stroke="rgba(255,255,255,0.35)"
      stroke-width="1"
    />
  </svg>`,
  iconSize: [12, 20],
  iconAnchor: [6, 10],
})

function FitSpots({ spots }) {
  const map = useMap()
  useEffect(() => {
    if (!spots.length) return
    const lats = spots.map(s => s.lat)
    const lngs = spots.map(s => s.lng)
    map.fitBounds(
      [[Math.min(...lats) - 0.00008, Math.min(...lngs) - 0.00008],
       [Math.max(...lats) + 0.00008, Math.max(...lngs) + 0.00008]],
      { animate: false, maxZoom: 20 }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots.length])
  return null
}

function PanToSelected({ spot }) {
  const map = useMap()
  useEffect(() => {
    if (spot?.lat) map.panTo([spot.lat, spot.lng], { animate: true, duration: 0.4 })
  }, [map, spot])
  return null
}

export default function GISSpotMap({ allSpots, activeZone, selectedSpot, onSelect }) {
  const { t } = useSettings()

  // Only available spots with real GPS coords
  const gpsAvail = allSpots.filter(s => s.lat && s.lng && s.status === 'available')

  // Active zone: full-colour selectable bays
  const activeSpots = gpsAvail.filter(s => s.zone === activeZone)
  // Other zones: faint context bays (not selectable)
  const contextSpots = gpsAvail.filter(s => s.zone !== activeZone)

  const allLats = gpsAvail.map(s => s.lat)
  const allLngs = gpsAvail.map(s => s.lng)
  const centre = gpsAvail.length
    ? [(Math.min(...allLats) + Math.max(...allLats)) / 2,
       (Math.min(...allLngs) + Math.max(...allLngs)) / 2]
    : [32.8950, 13.1725]

  const zoneColor = ZONE_HUE[activeZone] || '#2BCBBA'

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid ' + C.border, position: 'relative' }}>
      <MapContainer
        center={centre}
        zoom={19}
        style={{ height: 430, width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Esri satellite tiles */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
          maxZoom={21}
          maxNativeZoom={20}
        />

        <FitSpots spots={activeSpots.length ? activeSpots : gpsAvail} />
        <PanToSelected spot={selectedSpot} />

        {/* Other zones — faint context only */}
        {contextSpots.map(spot => (
          <Marker key={spot.id + '_ctx'} position={[spot.lat, spot.lng]} icon={dimBayIcon()} interactive={false} />
        ))}

        {/* Active zone — full-colour, selectable */}
        {activeSpots.map(spot => {
          const sel = selectedSpot?.id === spot.id
          return (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={bayIcon(zoneColor, sel)}
              eventHandlers={{ click: () => onSelect(spot) }}
            >
              {sel && (
                <Tooltip direction="top" offset={[0, -14]} opacity={0.95} permanent>
                  <span style={{ fontWeight: 700, fontSize: '0.72rem' }}>{spot.id} ✓</span>
                </Tooltip>
              )}
            </Marker>
          )
        })}
      </MapContainer>

      {/* Available count badge */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000,
        background: zoneColor, borderRadius: 20,
        padding: '5px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      }}>
        <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>
          {activeSpots.length} {t('available')}
        </span>
      </div>

      {/* Hint when nothing selected */}
      {!selectedSpot && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(0,0,0,0.72)', borderRadius: 20,
          padding: '6px 14px', color: '#fff', fontSize: '0.73rem', fontWeight: 600,
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {t('tap_spot_hint')}
        </div>
      )}
    </div>
  )
}
