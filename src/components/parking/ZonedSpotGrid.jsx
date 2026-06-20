import { SPOT_COLORS, ZONE_META } from '../../utils/spotsData'

const LEGEND = [
  { status: 'available', label: 'Available' },
  { status: 'occupied', label: 'Occupied' },
  { status: 'reserved', label: 'Reserved' },
  { status: 'selected', label: 'Selected' },
]

function Spot({ spot, zoneColor, isSelected, onSelect }) {
  const status = isSelected ? 'selected' : spot.status
  const colors = SPOT_COLORS[status]
  const clickable = spot.status === 'available'

  return (
    <div
      onClick={() => clickable && onSelect(spot)}
      title={spot.id + ' — ' + spot.status}
      style={{
        width: spot.zone === 'bus' ? '64px' : '40px',
        height: '46px',
        borderRadius: '6px',
        background: colors.bg,
        border: '2px solid ' + colors.border,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: clickable ? 'pointer' : 'default',
        fontSize: '0.65rem', fontWeight: 700, color: colors.text,
        userSelect: 'none',
        transform: isSelected ? 'scale(1.12)' : 'scale(1)',
        boxShadow: isSelected ? '0 0 0 3px #0984e3' : 'none',
        transition: 'transform 0.12s',
        position: 'relative',
      }}
    >
      {clickable && (
        <span style={{ position: 'absolute', top: 2, right: 3, fontSize: '0.55rem' }}>✓</span>
      )}
      <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>
        {spot.status === 'occupied' ? '🚗' : spot.status === 'reserved' ? '⏱' : ''}
      </span>
      <span>{spot.id}</span>
    </div>
  )
}

function ZoneBlock({ zoneKey, zone, selectedSpot, onSelect }) {
  const meta = ZONE_META[zoneKey]
  const available = zone.spots.filter((s) => s.status === 'available').length

  // group spots by row
  const rows = {}
  zone.spots.forEach((s) => {
    if (!rows[s.rowLabel]) rows[s.rowLabel] = []
    rows[s.rowLabel].push(s)
  })

  return (
    <div style={{
      background: '#fff', border: '1.5px solid ' + meta.color + '40',
      borderRadius: '12px', padding: '1.2rem', marginBottom: '1.2rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.3rem' }}>{meta.icon}</span>
          <strong style={{ color: '#1a1a2e' }}>{zone.label}</strong>
        </div>
        <span style={{
          background: meta.color + '18', color: meta.color,
          fontSize: '0.78rem', fontWeight: 700, padding: '3px 12px', borderRadius: '20px',
        }}>
          {available} free
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-block', background: '#f0f2f5', borderRadius: '10px', padding: '12px', minWidth: 'max-content' }}>
          {Object.entries(rows).map(([label, spots]) => (
            <div key={label} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
              <div style={{ width: 20, fontSize: '0.72rem', fontWeight: 700, color: '#868e96' }}>{label}</div>
              {spots.sort((a, b) => a.number - b.number).map((s) => (
                <Spot
                  key={s.id}
                  spot={s}
                  zoneColor={meta.color}
                  isSelected={selectedSpot?.id === s.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ZonedSpotGrid({ lotLayout, selectedSpot, onSelect }) {
  // Render disability + bus first (near entrance), then regular
  const order = ['disability', 'bus', 'regular']

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
        {LEGEND.map((l) => (
          <div key={l.status} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: SPOT_COLORS[l.status].bg, border: '2px solid ' + SPOT_COLORS[l.status].border }} />
            <span style={{ color: '#636e72' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {order.map((key) =>
        lotLayout.zones[key] ? (
          <ZoneBlock
            key={key}
            zoneKey={key}
            zone={lotLayout.zones[key]}
            selectedSpot={selectedSpot}
            onSelect={onSelect}
          />
        ) : null
      )}

      {/* Entrance marker */}
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <div style={{ display: 'inline-block', background: '#1a1a2e', color: '#fff', padding: '6px 24px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
          ⬇ MAIN ENTRANCE / EXIT ⬇
        </div>
      </div>
    </div>
  )
}
