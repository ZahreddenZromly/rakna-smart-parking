import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { ZONE_META } from '../../utils/spotsData'
import RouteToSpot from './RouteToSpot'

const buildDirections = (spot, t) => {
  const steps = [t('r_enter')]
  if (spot.zone === 'disability') steps.push(t('r_dis'))
  else if (spot.zone === 'bus') steps.push(t('r_bus'))
  else steps.push(t('r_reg'))
  steps.push(spot.nearEntrance
    ? `${t('nav_straight')} ${spot.rowLabel} — ${t('walk_from_gate')}.`
    : `${t('nav_straight')} ${spot.rowLabel}.`
  )
  steps.push(`${t('r_arrive')} ${spot.id}.`)
  return steps
}

export default function SpotDetailPanel({ spot, lot, onClose, onReserve }) {
  const { t } = useSettings()
  if (!spot) return null

  const zone = ZONE_META[spot.zone]
  const directions = buildDirections(spot, t)
  const walkMins = Math.max(1, Math.round((spot.row + 1) * 0.4))

  return (
    <div style={{
      background: C.white,
      border: '2px solid var(--brand)',
      borderRadius: R.card,
      padding: 'clamp(16px, 4vw, 24px)',
      marginBottom: 20,
      boxShadow: SHADOW.card,
      fontFamily: FONT,
      animation: 'popIn 0.25s ease',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: R.md,
            background: zone.color + '20', color: zone.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', flexShrink: 0,
          }}>
            {zone.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: C.black, fontWeight: 800 }}>
                {t('spot')} {spot.id}
              </h3>
              <span style={{
                background: 'rgba(47,143,91,0.12)', color: 'var(--success)',
                fontSize: '0.7rem', fontWeight: 700,
                padding: '3px 10px', borderRadius: R.pill,
              }}>
                {t('available')}
              </span>
            </div>
            <div style={{ color: C.textMuted, fontSize: '0.85rem', marginTop: 2 }}>
              {t(zone.key)} · {lot.name}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: C.grey, border: 'none', borderRadius: R.sm,
          width: 32, height: 32, cursor: 'pointer',
          color: C.textSoft, fontSize: '1rem', flexShrink: 0,
        }}>✕</button>
      </div>

      {/* Quick facts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: 10, marginTop: 16,
      }}>
        {[
          { label: t('zone'),          value: t(zone.key) },
          { label: t('parking_place'), value: spot.rowLabel },
          { label: t('rate'),          value: lot.pricePerHour + ' د.ل' },
          { label: t('walk_from_gate'),value: '~' + walkMins + ' ' + t('nav_min') },
        ].map((f) => (
          <div key={f.label} style={{ background: C.grey, borderRadius: R.md, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.7rem', color: C.textMuted }}>{f.label}</div>
            <div style={{ fontWeight: 700, color: C.black, fontSize: '0.9rem', marginTop: 2 }}>{f.value}</div>
          </div>
        ))}
      </div>

      {/* Animated route */}
      <div style={{ marginTop: 16 }}>
        <RouteToSpot spot={spot} />
      </div>

      {/* Directions */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, color: C.black, marginBottom: 10, fontSize: '0.92rem' }}>
          📍 {t('how_to_reach')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {directions.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                minWidth: 22, height: 22, borderRadius: '50%',
                background: i === directions.length - 1 ? 'var(--brand)' : C.ink,
                color: C.onInk, fontSize: '0.7rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
              }}>
                {i === directions.length - 1 ? '★' : i + 1}
              </div>
              <span style={{ color: C.textSoft, fontSize: '0.88rem', lineHeight: 1.4 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reserve button */}
      <button onClick={() => onReserve(spot)} style={{
        marginTop: 20, width: '100%', padding: '14px',
        background: 'var(--brand)', color: 'var(--on-ink)',
        border: 'none', borderRadius: R.pill,
        fontWeight: 700, fontSize: '1rem',
        cursor: 'pointer', fontFamily: FONT,
        boxShadow: SHADOW.brand,
      }}>
        {t('view_reserve')} {spot.id} ←
      </button>
    </div>
  )
}