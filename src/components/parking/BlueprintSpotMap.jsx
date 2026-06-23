import { useMemo } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { C } from '../../styles/theme'
import { LOT_BLUEPRINT } from '../../utils/lotBlueprint'
import { GATES } from '../../utils/spotsData'

// Zone colours match the engineers' CAD drawing (A=taxi, B=reservation, C=regular, D=bus)
const ZONE_HUE = {
  taxi:        '#F2A900',
  reservation: '#A55EEA',
  regular:     '#2BCBBA',
  bus:         '#6C5CE7',
  disability:  '#0984E3',
}

// CAD Y is "up"; SVG Y is "down" — flip around the top of the drawing
const WORLD_TOP = LOT_BLUEPRINT.clip.maxY
const fx = (x) => x
const fy = (y) => WORLD_TOP - y

// A bay is a small rectangle: long axis ACROSS the row, short axis ALONG it.
// We infer the row direction from each spot's nearest same-zone neighbour.
const BAY_W = 2.7   // along the row (CAD units)
const BAY_D = 5.0   // depth, perpendicular to the row

function bayCorners(spot, neighbours) {
  let best = null, bd = Infinity
  for (const n of neighbours) {
    if (n === spot) continue
    const dx = n.x - spot.x, dy = n.y - spot.y
    const d = dx * dx + dy * dy
    if (d < bd) { bd = d; best = n }
  }
  let rx = 1, ry = 0
  if (best) {
    const dx = best.x - spot.x, dy = best.y - spot.y
    const L = Math.hypot(dx, dy) || 1
    rx = dx / L; ry = dy / L
  }
  const nx = -ry, ny = rx                 // perpendicular = depth direction
  const hw = BAY_W / 2, hd = BAY_D / 2
  const c = [
    [spot.x + rx * hw + nx * hd, spot.y + ry * hw + ny * hd],
    [spot.x - rx * hw + nx * hd, spot.y - ry * hw + ny * hd],
    [spot.x - rx * hw - nx * hd, spot.y - ry * hw - ny * hd],
    [spot.x + rx * hw - nx * hd, spot.y + ry * hw - ny * hd],
  ]
  return c.map(([x, y]) => `${fx(x).toFixed(1)},${fy(y).toFixed(1)}`).join(' ')
}

// keep only the line segments that touch the visible window (cuts 1000+ context lines)
const segInView = (l, vb) =>
  Math.max(l[0], l[2]) >= vb.x0 && Math.min(l[0], l[2]) <= vb.x1 &&
  Math.max(l[1], l[3]) >= vb.yw0 && Math.min(l[1], l[3]) <= vb.yw1

export default function BlueprintSpotMap({ allSpots, activeZone, selectedSpot, onSelect }) {
  const { t } = useSettings()

  // only spots that carry real CAD coordinates can be drawn on the blueprint
  const mapped = allSpots.filter((s) => typeof s.x === 'number' && typeof s.y === 'number')
  const activeSpots = mapped.filter((s) => s.zone === activeZone)
  const otherSpots  = mapped.filter((s) => s.zone !== activeZone)
  const zoneColor = ZONE_HUE[activeZone] || '#2BCBBA'
  const availCount = activeSpots.filter((s) => s.status === 'available').length

  // Fit the view to the active zone (bays stay big enough to tap) + padding for context
  const view = useMemo(() => {
    const base = activeSpots.length ? activeSpots : mapped
    if (!base.length) return null
    const PAD = 24
    const xs = base.map((s) => s.x), ys = base.map((s) => s.y)
    const x0 = Math.min(...xs) - PAD, x1 = Math.max(...xs) + PAD
    const yTop = fy(Math.max(...ys)) - PAD, yBot = fy(Math.min(...ys)) + PAD
    return {
      viewBox: `${x0} ${yTop} ${x1 - x0} ${yBot - yTop}`,
      // window in CAD space for culling context geometry
      x0, x1, yw0: Math.min(...ys) - PAD, yw1: Math.max(...ys) + PAD,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeZone, mapped.length])

  if (!view) {
    return (
      <div style={{ borderRadius: 16, border: '2px solid ' + C.border, padding: 40, textAlign: 'center', color: C.textMuted }}>
        {t('spots_not_mapped') || "This zone isn't on the map yet."}
      </div>
    )
  }

  const buildings = LOT_BLUEPRINT.buildings.filter((l) => segInView(l, view))
  const roads = LOT_BLUEPRINT.roads.filter((l) => segInView(l, view))
  const zoneLines = LOT_BLUEPRINT.zones[activeZone] || []
  const label = activeSpots[0]?.prefix

  // zone centroid for the big background letter
  const cx = activeSpots.reduce((a, s) => a + s.x, 0) / (activeSpots.length || 1)
  const cy = activeSpots.reduce((a, s) => a + s.y, 0) / (activeSpots.length || 1)

  const gates = GATES.filter((g) => g.x >= view.x0 && g.x <= view.x1 && g.y >= view.yw0 && g.y <= view.yw1)

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid ' + C.border, position: 'relative', background: '#0d1117', isolation: 'isolate' }}>
      <svg viewBox={view.viewBox} style={{ width: '100%', height: 430, display: 'block' }} preserveAspectRatio="xMidYMid meet">
        {/* paper */}
        <rect x={view.x0} y={fy(view.yw1) - 24} width="100%" height="100%" fill="#0d1117" />

        {/* context buildings — faint blueprint surroundings */}
        <g stroke="rgba(120,140,170,0.22)" strokeWidth={0.28} strokeLinecap="round">
          {buildings.map((l, i) => (
            <line key={'b' + i} x1={fx(l[0])} y1={fy(l[1])} x2={fx(l[2])} y2={fy(l[3])} />
          ))}
        </g>

        {/* driving lanes / roads */}
        <g stroke="rgba(150,170,200,0.55)" strokeWidth={1.1} strokeLinecap="round">
          {roads.map((l, i) => (
            <line key={'r' + i} x1={fx(l[0])} y1={fy(l[1])} x2={fx(l[2])} y2={fy(l[3])} />
          ))}
        </g>

        {/* active zone outline / direction arrows from the CAD */}
        <g stroke={zoneColor} strokeWidth={0.55} strokeLinecap="round" opacity={0.7}>
          {zoneLines.map((l, i) => (
            <line key={'z' + i} x1={fx(l[0])} y1={fy(l[1])} x2={fx(l[2])} y2={fy(l[3])} />
          ))}
        </g>

        {/* big faint zone letter */}
        {label && (
          <text x={fx(cx)} y={fy(cy)} fill={zoneColor} fillOpacity={0.14}
            fontSize={18} fontWeight="900" textAnchor="middle" dominantBaseline="central">
            {label}
          </text>
        )}

        {/* other zones — faint context bays (not selectable) */}
        <g>
          {otherSpots.map((s) => (
            <polygon key={s.id + '_o'} points={bayCorners(s, otherSpots)}
              fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth={0.2} />
          ))}
        </g>

        {/* active zone bays */}
        <g>
          {activeSpots.map((s) => {
            const sel = selectedSpot?.id === s.id
            const avail = s.status === 'available'
            let fill, stroke, sw, clickable
            if (sel) {
              fill = zoneColor; stroke = '#1d6ef5'; sw = 0.7; clickable = true
            } else if (avail) {
              fill = zoneColor; stroke = 'rgba(255,255,255,0.9)'; sw = 0.35; clickable = true
            } else if (s.status === 'reserved') {
              fill = 'rgba(245,180,60,0.4)'; stroke = 'rgba(245,180,60,0.7)'; sw = 0.3; clickable = false
            } else {
              fill = 'rgba(120,132,148,0.4)'; stroke = 'rgba(160,172,188,0.6)'; sw = 0.3; clickable = false
            }
            return (
              <polygon key={s.id} points={bayCorners(s, activeSpots)}
                fill={fill} fillOpacity={sel ? 1 : 0.92} stroke={stroke} strokeWidth={sw}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                onClick={clickable ? () => onSelect(s) : undefined}>
                <title>{s.id} — {avail ? t('available') : s.status}</title>
              </polygon>
            )
          })}
        </g>

        {/* selected bay ID label */}
        {selectedSpot && activeSpots.some((s) => s.id === selectedSpot.id) && (
          <text x={fx(selectedSpot.x)} y={fy(selectedSpot.y)} fill="#fff"
            fontSize={2.4} fontWeight="800" textAnchor="middle" dominantBaseline="central"
            style={{ pointerEvents: 'none' }}>
            {selectedSpot.id.split('-')[1]}
          </text>
        )}

        {/* entrance / exit gates */}
        <g>
          {gates.map((g, i) => {
            const isIn = g.type === 'entrance'
            return (
              <g key={'g' + i}>
                <circle cx={fx(g.x)} cy={fy(g.y)} r={2.6} fill={isIn ? '#16a34a' : '#ef4444'} stroke="#fff" strokeWidth={0.4} />
                <text x={fx(g.x)} y={fy(g.y)} fill="#fff" fontSize={2.1} fontWeight="800"
                  textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>
                  {isIn ? 'IN' : 'EX'}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* available count badge */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 5,
        background: zoneColor, borderRadius: 20, padding: '5px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      }}>
        <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>
          {availCount} {t('available')}
        </span>
      </div>

      {/* legend */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, zIndex: 5,
        background: 'rgba(13,17,23,0.82)', borderRadius: 12, padding: '8px 10px',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        {[
          [zoneColor, t('available')],
          ['rgba(245,180,60,0.6)', t('reserved_label') || 'Reserved'],
          ['rgba(120,132,148,0.6)', t('occupied_label') || 'Occupied'],
        ].map(([col, lab]) => (
          <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 11, height: 16, borderRadius: 2, background: col, border: '1px solid rgba(255,255,255,0.5)' }} />
            <span style={{ color: '#fff', fontSize: '0.66rem', fontWeight: 600 }}>{lab}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#16a34a', border: '1px solid #fff' }} />
          <span style={{ color: '#fff', fontSize: '0.66rem', fontWeight: 600 }}>{t('entrance') || 'Entrance'} / {t('exit') || 'Exit'}</span>
        </div>
      </div>

      {/* hint */}
      {!selectedSpot && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 5, background: 'rgba(0,0,0,0.72)', borderRadius: 20,
          padding: '6px 14px', color: '#fff', fontSize: '0.73rem', fontWeight: 600,
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {t('tap_spot_hint')}
        </div>
      )}
    </div>
  )
}
