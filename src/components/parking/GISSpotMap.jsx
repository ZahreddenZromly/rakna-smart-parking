import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useSettings } from '../../context/SettingsContext'
import { C } from '../../styles/theme'

// Zone fill colours (visible against satellite tile)
const ZONE_HUE = {
  taxi:        '#F2A900',
  reservation: '#A55EEA',
  regular:     '#2BCBBA',
  bus:         '#6C5CE7',
  disability:  '#0984E3',
}

const spotFill = (spot, selected) => {
  if (selected) return '#fff'
  if (spot.status === 'occupied') return '#d63031'
  if (spot.status === 'reserved') return '#fdcb6e'
  return ZONE_HUE[spot.zone] || '#00b894'
}

// Auto-fit map to all visible spots whenever the list changes
function FitSpots({ spots }) {
  const map = useMap()
  useEffect(() => {
    if (!spots.length) return
    const lats = spots.map(s => s.lat)
    const lngs = spots.map(s => s.lng)
    map.fitBounds(
      [[Math.min(...lats) - 0.00005, Math.min(...lngs) - 0.00005],
       [Math.max(...lats) + 0.00005, Math.max(...lngs) + 0.00005]],
      { animate: false }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots.length])
  return null
}

// Highlight selected spot by panning to it
function PanToSelected({ spot }) {
  const map = useMap()
  useEffect(() => {
    if (spot?.lat) map.panTo([spot.lat, spot.lng], { animate: true, duration: 0.4 })
  }, [map, spot])
  return null
}

export default function GISSpotMap({ allSpots, activeZone, selectedSpot, onSelect }) {
  const { t } = useSettings()
  const mapRef = useRef(null)

  // All spots with GPS coords; filter only the active zone
  const gpsSpots = allSpots.filter(s => s.lat && s.lng)
  const zoneSpots = activeZone ? gpsSpots.filter(s => s.zone === activeZone) : gpsSpots

  // Compute initial centre from all GPS spots
  const allLats = gpsSpots.map(s => s.lat)
  const allLngs = gpsSpots.map(s => s.lng)
  const centre = gpsSpots.length
    ? [(Math.min(...allLats) + Math.max(...allLats)) / 2,
       (Math.min(...allLngs) + Math.max(...allLngs)) / 2]
    : [32.8950, 13.1725]

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid ' + C.border, position: 'relative' }}>
      <MapContainer
        ref={mapRef}
        center={centre}
        zoom={19}
        style={{ height: 420, width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Esri World Imagery — free satellite tiles */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
          maxZoom={21}
          maxNativeZoom={20}
        />

        <FitSpots spots={zoneSpots} />
        <PanToSelected spot={selectedSpot} />

        {/* Dim spots from OTHER zones so active zone pops */}
        {gpsSpots.filter(s => s.zone !== activeZone).map(spot => (
          <CircleMarker
            key={spot.id + '_dim'}
            center={[spot.lat, spot.lng]}
            radius={5}
            pathOptions={{ fillColor: '#9b9b9b', fillOpacity: 0.35, color: '#fff', weight: 0.5 }}
          />
        ))}

        {/* Active zone spots — full colour */}
        {zoneSpots.map(spot => {
          const sel = selectedSpot?.id === spot.id
          const avail = spot.status === 'available'
          return (
            <CircleMarker
              key={spot.id}
              center={[spot.lat, spot.lng]}
              radius={sel ? 11 : 7}
              pathOptions={{
                fillColor: spotFill(spot, sel),
                fillOpacity: 1,
                color: sel ? '#0984E3' : avail ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                weight: sel ? 3 : 1.5,
              }}
              eventHandlers={{ click: () => avail && onSelect(spot) }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95} permanent={sel}>
                <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>
                  {spot.id}{sel ? ' ✓' : ''}
                </span>
              </Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Legend overlay */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)', borderRadius: 10,
        padding: '7px 11px', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {[
          { color: ZONE_HUE[activeZone] || '#2BCBBA', label: t('available') },
          { color: '#fdcb6e', label: t('reserved_label') || 'Reserved' },
          { color: '#d63031', label: t('occupied_label') || 'Occupied' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ color: '#fff', fontSize: '0.68rem', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* "Tap a green spot" hint when nothing selected */}
      {!selectedSpot && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(0,0,0,0.72)', borderRadius: 20,
          padding: '6px 14px', color: '#fff', fontSize: '0.75rem', fontWeight: 600,
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {t('tap_spot_hint') || '👆 Tap a spot to select it'}
        </div>
      )}
    </div>
  )
}
