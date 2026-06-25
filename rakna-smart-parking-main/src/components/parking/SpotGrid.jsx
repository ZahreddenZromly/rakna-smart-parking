import { C, R, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { SPOT_COLORS } from '../../utils/spotsData'

const LEGEND_KEYS = [
  { status: 'available', key: 'available' },
  { status: 'occupied',  key: 'full' },
  { status: 'reserved',  key: 'reserved' },
  { status: 'selected',  key: 'selected' },
]

export default function SpotGrid({ layout, selectedSpot, onSelectSpot }) {
  const { t } = useSettings()
  const { spots, cols, entranceSide } = layout
  const rows = Math.max(...spots.map((s) => s.row)) + 1

  const spotAt = (r, c) => spots.find((s) => s.row === r && s.col === c)
  const getStatus = (spot) => {
    if (!spot) return null
    if (selectedSpot && spot.id === selectedSpot.id) return 'selected'
    return spot.status
  }

  return (
    <div style={{ fontFamily: FONT }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        {LEGEND_KEYS.map((l) => (
          <div key={l.status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
            <div style={{
              width: 14, height: 14, borderRadius: 3,
              background: SPOT_COLORS[l.status].bg,
              border: '2px solid ' + SPOT_COLORS[l.status].border,
            }} />
            <span style={{ color: C.textSoft }}>{t(l.key)}</span>
          </div>
        ))}
      </div>

      {entranceSide === 'bottom' && (
        <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--success)', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          ^ {t('parking_details')} ^
        </div>
      )}

      <div className="no-scrollbar" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{
          display: 'inline-block', padding: 14,
          background: C.grey, borderRadius: R.card, minWidth: 'max-content',
        }}>
          {/* Drive lane top */}
          <div style={{
            height: 18, background: C.border, borderRadius: R.sm,
            marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.62rem', color: C.textMuted, letterSpacing: 2 }}>DRIVE LANE</span>
          </div>

          {Array.from({ length: rows }).map((_, r) => (
            <div key={r}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: C.textMuted }}>
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
                        width: 44, height: 52, borderRadius: R.sm,
                        background: colors.bg,
                        border: '2px solid ' + colors.border,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        cursor: isClickable ? 'pointer' : 'default',
                        transition: 'transform 0.1s',
                        fontSize: '0.68rem', fontWeight: 700, color: colors.text,
                        userSelect: 'none',
                        transform: selectedSpot?.id === spot.id ? 'scale(1.1)' : 'scale(1)',
                        boxShadow: selectedSpot?.id === spot.id ? '0 0 0 3px var(--accent)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '0.95rem' }}>
                        {status === 'occupied' ? '🚗' : status === 'reserved' ? '⏱' : status === 'selected' ? '✓' : spot.type === 'disabled_access' ? '♿' : ''}
                      </span>
                      <span>{spot.id}</span>
                    </div>
                  )
                })}
              </div>

              {r % 2 === 1 && r < rows - 1 && (
                <div style={{
                  height: 14, background: C.border, borderRadius: 3,
                  marginBottom: 6, marginInlineStart: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '0.6rem', color: C.textMuted, letterSpacing: 2 }}>DRIVE LANE</span>
                </div>
              )}
            </div>
          ))}

          {/* Drive lane bottom */}
          <div style={{
            height: 18, background: C.border, borderRadius: R.sm,
            marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '0.62rem', color: C.textMuted, letterSpacing: 2 }}>DRIVE LANE</span>
          </div>
        </div>
      </div>

      {entranceSide === 'bottom' && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--brand)', color: 'var(--on-ink)',
            padding: '5px 20px', borderRadius: R.md,
            fontSize: '0.82rem', fontWeight: 700, fontFamily: FONT,
          }}>
            {t('entrance')} / {t('exit')}
          </div>
        </div>
      )}
    </div>
  )
}