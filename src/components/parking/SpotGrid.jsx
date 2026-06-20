import { SPOT_COLORS } from '../../utils/spotsData'

const LEGEND = [
  { status: 'available', label: 'Available' },
  { status: 'occupied', label: 'Occupied' },
  { status: 'reserved', label: 'Reserved' },
  { status: 'selected', label: 'Your Pick' },
]

export default function SpotGrid({ layout, selectedSpot, onSelectSpot }) {
  const { spots, cols, entranceSide } = layout
  const rows = Math.max(...spots.map((s) => s.row)) + 1

  const spotAt = (r, c) => spots.find((s) => s.row === r && s.col === c)

  const getStatus = (spot) => {
    if (!spot) return null
    if (selectedSpot && spot.id === selectedSpot.id) return 'selected'
    return spot.status
  }

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

      {/* Entrance label */}
      {entranceSide === 'bottom' && (
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#00b894', fontWeight: 700, marginBottom: '8px', letterSpacing: 1 }}>
          ^ PARKING AREA ^
        </div>
      )}

      {/* Grid */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-block', padding: '1rem', background: '#f0f2f5', borderRadius: '12px', minWidth: 'max-content' }}>
          {/* Drive lane at top */}
          <div style={{ height: '18px', background: '#dee2e6', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: '#868e96', letterSpacing: 2 }}>DRIVE LANE</span>
          </div>

          {Array.from({ length: rows }).map((_, r) => (
            <div key={r}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                {/* Row label */}
                <div style={{ width: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#636e72' }}>
                  {spots.find((s) => s.row === r)?.rowLabel}
                </div>

                {Array.from({ length: cols }).map((_, c) => {
                  const spot = spotAt(r, c)
                  if (!spot) return <div key={c} style={{ width: 44, height: 52 }} />
                  const status = getStatus(spot)
                  const colors = SPOT_COLORS[status]
                  const isClickable = spot.status === 'available'

                  return (
                    <div
                      key={c}
                      onClick={() => isClickable && onSelectSpot(spot)}
                      title={spot.id + ' — ' + spot.status}
                      style={{
                        width: '44px', height: '52px', borderRadius: '6px',
                        background: colors.bg,
                        border: '2px solid ' + colors.border,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: isClickable ? 'pointer' : 'default',
                        transition: 'transform 0.1s',
                        fontSize: '0.7rem', fontWeight: 700, color: colors.text,
                        userSelect: 'none',
                        transform: selectedSpot?.id === spot.id ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: selectedSpot?.id === spot.id ? '0 0 0 3px #0984e3' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>
                        {status === 'occupied' ? '🚗' : status === 'reserved' ? '⏱' : status === 'selected' ? '✓' : spot.type === 'disabled_access' ? '♿' : ''}
                      </span>
                      <span>{spot.id}</span>
                    </div>
                  )
                })}
              </div>

              {/* Drive lane between every 2 rows */}
              {r % 2 === 1 && r < rows - 1 && (
                <div style={{ height: '14px', background: '#dee2e6', borderRadius: '3px', marginBottom: '6px', marginLeft: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: '#868e96', letterSpacing: 2 }}>DRIVE LANE</span>
                </div>
              )}
            </div>
          ))}

          {/* Bottom lane */}
          <div style={{ height: '18px', background: '#dee2e6', borderRadius: '4px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: '#868e96', letterSpacing: 2 }}>DRIVE LANE</span>
          </div>
        </div>
      </div>

      {/* Entrance arrow */}
      {entranceSide === 'bottom' && (
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <div style={{ display: 'inline-block', background: '#00b894', color: '#fff', padding: '5px 20px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700 }}>
            ENTRANCE / EXIT
          </div>
        </div>
      )}
    </div>
  )
}
