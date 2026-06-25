import { C, R, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { SPOT_COLORS, ZONE_META } from '../../utils/spotsData'

const LEGEND_KEYS = [
  { status: 'available', key: 'available' },
  { status: 'occupied',  key: 'full' },
  { status: 'reserved',  key: 'reserved' },
  { status: 'selected',  key: 'selected' },
]

function Spot({ spot, isSelected, onSelect }) {
  const status = isSelected ? 'selected' : spot.status
  const colors = SPOT_COLORS[status]
  const clickable = spot.status === 'available'

  return (
    <div
      onClick={() => clickable && onSelect(spot)}
      title={spot.id + ' — ' + spot.status}
      style={{
        width: spot.zone === 'bus' ? 64 : 40,
        height: 46, borderRadius: R.sm,
        background: colors.bg,
        border: '2px solid ' + colors.border,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: clickable ? 'pointer' : 'default',
        fontSize: '0.65rem', fontWeight: 700, color: colors.text,
        userSelect: 'none',
        transform: isSelected ? 'scale(1.12)' : 'scale(1)',
        boxShadow: isSelected ? '0 0 0 3px var(--accent)' : 'none',
        transition: 'transform 0.12s',
        position: 'relative',
        fontFamily: FONT,
      }}
    >
      {clickable && (
        <span style={{ position: 'absolute', top: 2, insetInlineEnd: 3, fontSize: '0.55rem' }}>✓</span>
      )}
      <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>
        {spot.status === 'occupied' ? '🚗' : spot.status === 'reserved' ? '⏱' : ''}
      </span>
      <span>{spot.id}</span>
    </div>
  )
}

function ZoneBlock({ zoneKey, zone, selectedSpot, onSelect }) {
  const { t } = useSettings()
  const meta = ZONE_META[zoneKey]
  const available = zone.spots.filter((s) => s.status === 'available').length

  const rows = {}
  zone.spots.forEach((s) => {
    if (!rows[s.rowLabel]) rows[s.rowLabel] = []
    rows[s.rowLabel].push(s)
  })

  return (
    <div style={{
      background: C.white,
      border: '1.5px solid ' + meta.color + '40',
      borderRadius: R.card, padding: 'clamp(12px, 3vw, 20px)',
      marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.2rem' }}>{meta.icon}</span>
          <strong style={{ color: C.black, fontFamily: FONT }}>{t(meta.key)}</strong>
        </div>
        <span style={{
          background: meta.color + '18', color: meta.color,
          fontSize: '0.76rem', fontWeight: 700,
          padding: '3px 12px', borderRadius: R.pill,
        }}>
          {available} {t('available_count')}
        </span>
      </div>

      <div className="no-scrollbar" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{
          display: 'inline-block', background: C.grey,
          borderRadius: R.md, padding: 12, minWidth: 'max-content',
        }}>
          {Object.entries(rows).map(([label, spots]) => (
            <div key={label} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
              <div style={{ width: 20, fontSize: '0.72rem', fontWeight: 700, color: C.textMuted }}>{label}</div>
              {spots.sort((a, b) => a.number - b.number).map((s) => (
                <Spot key={s.id} spot={s} isSelected={selectedSpot?.id === s.id} onSelect={onSelect} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ZonedSpotGrid({ lotLayout, selectedSpot, onSelect }) {
  const { t } = useSettings()
  const order = ['disability', 'bus', 'regular']

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
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{
          display: 'inline-block',
          background: 'var(--brand)', color: 'var(--on-ink)',
          padding: '6px 24px', borderRadius: R.md,
          fontSize: '0.82rem', fontWeight: 700, fontFamily: FONT,
        }}>
          ⬇ {t('entrance')} / {t('exit')} ⬇
        </div>
      </div>
    </div>
  )
}