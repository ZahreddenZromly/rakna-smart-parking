import { useState } from 'react'
import { C, R } from '../../styles/theme'
import { ZONE_META } from '../../utils/spotsData'

const STATUS_FILL = { available: '#2BBF6A', occupied: '#C7CDD4', reserved: '#F2B100' }
const PAD = 8

export default function InteractiveLotMap({ layout, selectedSpot, onSelect, t }) {
  const [zoom, setZoom] = useState(1.6)
  const bbox = layout.bbox
  const gates = layout.gates || []

  // all spots that have real coordinates
  const spots = Object.values(layout.zones)
    .flatMap((z) => z.spots)
    .filter((s) => s.mapped && isFinite(s.x) && isFinite(s.y))

  const vbW = (bbox.maxX - bbox.minX) + PAD * 2
  const vbH = (bbox.maxY - bbox.minY) + PAD * 2
  const sx = (x) => (x - bbox.minX) + PAD
  const sy = (y) => (bbox.maxY - y) + PAD   // flip Y (CAD up → screen down)

  // per-zone background rectangles (from each zone's spot extents)
  const zoneBoxes = Object.entries(layout.zones).map(([key, z]) => {
    const pts = z.spots.filter((s) => s.mapped)
    if (!pts.length) return null
    const xs = pts.map((s) => s.x), ys = pts.map((s) => s.y)
    const m = 3
    return {
      key,
      x: sx(Math.min(...xs)) - m, y: sy(Math.max(...ys)) - m,
      w: (Math.max(...xs) - Math.min(...xs)) + m * 2,
      h: (Math.max(...ys) - Math.min(...ys)) + m * 2,
      color: ZONE_META[key].color, label: ZONE_META[key].prefix,
    }
  }).filter(Boolean)

  return (
    <div>
      {/* legend */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10, fontSize: '0.78rem' }}>
        {[['available', t('available')], ['occupied', t('full')], ['reserved', t('reserved') || 'Reserved']].map(([k, lbl]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textSoft }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: STATUS_FILL[k] }} /> {lbl}
          </span>
        ))}
      </div>

      <div className="no-scrollbar" style={{ overflow: 'auto', borderRadius: R.md, background: '#EDEFF2', border: '1px solid ' + C.greyMid, WebkitOverflowScrolling: 'touch' }}>
        <svg viewBox={`0 0 ${vbW} ${vbH}`} style={{ width: (100 * zoom) + '%', display: 'block' }} role="img" aria-label={t('facility_map')}>
          {/* zone areas */}
          {zoneBoxes.map((b) => (
            <g key={b.key}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill={b.color + '18'} stroke={b.color + '66'} strokeWidth="0.5" />
              <text x={b.x + 2} y={b.y + 5} fontSize="4" fontWeight="700" fill={b.color}>{b.label}</text>
            </g>
          ))}

          {/* gates */}
          {gates.map((g, i) => (
            <circle key={i} cx={sx(g.x)} cy={sy(g.y)} r="1.8"
              fill={g.type === 'entrance' ? '#2BBF6A' : '#E8503A'} stroke="#fff" strokeWidth="0.5">
              <title>{g.type}</title>
            </circle>
          ))}

          {/* spots */}
          {spots.map((s) => {
            const sel = selectedSpot?.id === s.id
            const clickable = s.status === 'available'
            return (
              <g key={s.id} onClick={() => clickable && onSelect(s)} style={{ cursor: clickable ? 'pointer' : 'default' }}>
                <rect
                  x={sx(s.x) - 1.25} y={sy(s.y) - 1.25} width="2.5" height="2.5" rx="0.5"
                  fill={sel ? '#0984E3' : STATUS_FILL[s.status]}
                  stroke={sel ? '#fff' : 'rgba(0,0,0,0.15)'} strokeWidth={sel ? 0.7 : 0.2}
                />
                {sel && <circle cx={sx(s.x)} cy={sy(s.y)} r="3" fill="none" stroke="#0984E3" strokeWidth="0.6" />}
                <title>{s.id} — {s.status}</title>
              </g>
            )
          })}
        </svg>
      </div>

      {/* zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10 }}>
        <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.4).toFixed(1)))} style={zbtn}>－</button>
        <span style={{ fontSize: '0.8rem', color: C.textMuted, minWidth: 46, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(5, +(z + 0.4).toFixed(1)))} style={zbtn}>＋</button>
      </div>
      {selectedSpot && (
        <div style={{ textAlign: 'center', marginTop: 8, fontWeight: 700, color: C.black }}>
          {t('selected')}: {selectedSpot.id}
        </div>
      )}
    </div>
  )
}

const zbtn = {
  width: 38, height: 38, borderRadius: '50%', border: '1.5px solid ' + C.greyMid,
  background: C.white, color: C.black, fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700,
}
