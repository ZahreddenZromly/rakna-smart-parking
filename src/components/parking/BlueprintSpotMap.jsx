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

// Comfortable "architect's plan" palette (light)
const PAPER     = '#eaeef4'
const BUILDING  = 'rgba(96,116,148,0.38)'
const ROADLINE  = 'rgba(70,98,140,0.6)'
const BAY_LINE  = 'rgba(30,41,59,0.32)'
const CTX_FILL  = 'rgba(80,100,130,0.10)'
const CTX_LINE  = 'rgba(80,100,130,0.30)'

// CAD Y is "up"; SVG Y is "down" — flip around the top of the drawing
const WORLD_TOP = LOT_BLUEPRINT.clip.maxY
const fx = (x) => x
const fy = (y) => WORLD_TOP - y

// Small tidy slots — kept narrow so bays never overlap, even where the real
// lot packs spots close together (e.g. the taxi ring + its inner island).
const BAY_W = 2.0   // along the row (CAD units)
const BAY_D = 2.9   // depth, perpendicular to the row

// Base bay angle = LOCAL ROW DIRECTION. Take the nearest neighbour, then the
// nearest one on the OPPOSITE side (>120° apart). Those two bracket the spot,
// so the line through them is the true row tangent — works for straight rows,
// ring sides, and inner islands alike. This is then smoothed across each row
// (see buildAngleMap) so a whole row locks to one clean, parallel direction.
function baseRowAngle(spot, peers) {
  const others = peers
    .filter((o) => o !== spot)
    .map((o) => ({ dx: o.x - spot.x, dy: o.y - spot.y, d: (o.x - spot.x) ** 2 + (o.y - spot.y) ** 2 }))
    .sort((a, b) => a.d - b.d)
  if (!others.length) return 0
  const n1 = others[0]
  const a1 = Math.atan2(n1.dy, n1.dx)
  let n2 = null
  for (const o of others.slice(1)) {
    let da = Math.abs(Math.atan2(o.dy, o.dx) - a1)
    if (da > Math.PI) da = 2 * Math.PI - da
    if (da > 2.094) { n2 = o; break }   // ~120° → opposite side
  }
  const tx = n2 ? n1.dx - n2.dx : n1.dx
  const ty = n2 ? n1.dy - n2.dy : n1.dy
  return Math.atan2(ty, tx)
}

// For each zone, compute every bay's angle then smooth it against its nearest
// neighbours (averaging on the doubled angle so 0°/180° wrap correctly). A few
// passes make neighbouring bays in a row share one orientation → tidy rows.
function buildAngleMap(spots) {
  const n = spots.length
  let ang = spots.map((s) => baseRowAngle(s, spots))
  const K = 4
  const nb = spots.map((s) => spots
    .map((o, j) => ({ j, d: (o.x - s.x) ** 2 + (o.y - s.y) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(1, K + 1)            // skip self (distance 0)
    .map((e) => e.j))
  for (let it = 0; it < 3; it++) {
    const next = ang.slice()
    for (let i = 0; i < n; i++) {
      let cx = 2 * Math.cos(2 * ang[i]), sy = 2 * Math.sin(2 * ang[i])  // self weighted
      for (const j of nb[i]) { cx += Math.cos(2 * ang[j]); sy += Math.sin(2 * ang[j]) }
      next[i] = 0.5 * Math.atan2(sy, cx)
    }
    ang = next
  }
  const m = {}
  spots.forEach((s, i) => { m[s.id] = ang[i] })
  return m
}

function bayCorners(spot, ang) {
  const rx = Math.cos(ang), ry = Math.sin(ang)   // row tangent  → bay width
  const nx = -ry, ny = rx                         // perpendicular → bay depth
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

  // Smoothed bay angle per spot, computed per zone (same-zone = same rows).
  const angleByZone = useMemo(() => {
    const byZone = {}
    mapped.forEach((s) => { (byZone[s.zone] ||= []).push(s) })
    const out = {}
    Object.entries(byZone).forEach(([zone, spots]) => { out[zone] = buildAngleMap(spots) })
    return out
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapped.length])

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
  const label = activeZone === 'disability' ? '♿' : activeSpots[0]?.prefix

  // zone centroid for the big background symbol
  const cx = activeSpots.reduce((a, s) => a + s.x, 0) / (activeSpots.length || 1)
  const cy = activeSpots.reduce((a, s) => a + s.y, 0) / (activeSpots.length || 1)

  const gates = GATES.filter((g) => g.x >= view.x0 && g.x <= view.x1 && g.y >= view.yw0 && g.y <= view.yw1)

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid ' + C.border, position: 'relative', background: PAPER, isolation: 'isolate' }}>
      <svg viewBox={view.viewBox} style={{ width: '100%', height: 430, display: 'block', background: PAPER }} preserveAspectRatio="xMidYMid meet">
        {/* context buildings — faint blueprint surroundings */}
        <g stroke={BUILDING} strokeWidth={0.28} strokeLinecap="round">
          {buildings.map((l, i) => (
            <line key={'b' + i} x1={fx(l[0])} y1={fy(l[1])} x2={fx(l[2])} y2={fy(l[3])} />
          ))}
        </g>

        {/* driving lanes / roads */}
        <g stroke={ROADLINE} strokeWidth={1.1} strokeLinecap="round">
          {roads.map((l, i) => (
            <line key={'r' + i} x1={fx(l[0])} y1={fy(l[1])} x2={fx(l[2])} y2={fy(l[3])} />
          ))}
        </g>

        {/* active zone outline / direction arrows from the CAD */}
        <g stroke={zoneColor} strokeWidth={0.55} strokeLinecap="round" opacity={0.65}>
          {zoneLines.map((l, i) => (
            <line key={'z' + i} x1={fx(l[0])} y1={fy(l[1])} x2={fx(l[2])} y2={fy(l[3])} />
          ))}
        </g>

        {/* big faint zone letter / wheelchair */}
        {label && (
          <text x={fx(cx)} y={fy(cy)} fill={zoneColor} fillOpacity={0.16}
            fontSize={16} fontWeight="900" textAnchor="middle" dominantBaseline="central">
            {label}
          </text>
        )}

        {/* other zones — faint context bays (not selectable) */}
        <g>
          {otherSpots.map((s) => (
            <polygon key={s.id + '_o'} points={bayCorners(s, angleByZone[s.zone]?.[s.id] ?? 0)}
              fill={CTX_FILL} stroke={CTX_LINE} strokeWidth={0.2} />
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
              fill = zoneColor; stroke = BAY_LINE; sw = 0.32; clickable = true
            } else if (s.status === 'reserved') {
              fill = 'rgba(245,180,60,0.55)'; stroke = 'rgba(217,150,40,0.85)'; sw = 0.3; clickable = false
            } else {
              fill = 'rgba(148,163,184,0.6)'; stroke = 'rgba(100,116,139,0.8)'; sw = 0.3; clickable = false
            }
            return (
              <polygon key={s.id} points={bayCorners(s, angleByZone[s.zone]?.[s.id] ?? 0)}
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
            fontSize={2.3} fontWeight="800" textAnchor="middle" dominantBaseline="central"
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
                <circle cx={fx(g.x)} cy={fy(g.y)} r={2.6} fill={isIn ? '#16a34a' : '#ef4444'} stroke="#fff" strokeWidth={0.5} />
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}>
        <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>
          {availCount} {t('available')}
        </span>
      </div>

      {/* legend */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, zIndex: 5,
        background: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: '8px 10px',
        display: 'flex', flexDirection: 'column', gap: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}>
        {[
          [zoneColor, t('available')],
          ['rgba(245,180,60,0.7)', t('reserved_label') || 'Reserved'],
          ['rgba(148,163,184,0.8)', t('occupied_label') || 'Occupied'],
        ].map(([col, lab]) => (
          <div key={lab} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 11, height: 16, borderRadius: 2, background: col, border: '1px solid rgba(30,41,59,0.35)' }} />
            <span style={{ color: '#1e293b', fontSize: '0.66rem', fontWeight: 600 }}>{lab}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#16a34a', border: '1px solid #fff' }} />
          <span style={{ color: '#1e293b', fontSize: '0.66rem', fontWeight: 600 }}>{t('entrance') || 'Entrance'} / {t('exit') || 'Exit'}</span>
        </div>
      </div>

      {/* hint */}
      {!selectedSpot && (
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          zIndex: 5, background: 'rgba(15,23,42,0.82)', borderRadius: 20,
          padding: '6px 14px', color: '#fff', fontSize: '0.73rem', fontWeight: 600,
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {t('tap_spot_hint')}
        </div>
      )}
    </div>
  )
}
