import { ZONE_META } from '../../utils/spotsData'
import RouteToSpot from './RouteToSpot'

// Turn-by-turn style hint to reach the spot inside the lot
const buildDirections = (spot) => {
  const steps = ['Enter through the main gate (bottom of the lot).']

  if (spot.zone === 'disability') {
    steps.push('Turn right immediately — Disability Parking is right by the entrance.')
  } else if (spot.zone === 'bus') {
    steps.push('Keep straight to the far end — Bus / Coach bays are at the back.')
  } else {
    steps.push('Drive straight into the Regular Parking area.')
  }

  steps.push(
    spot.nearEntrance
      ? `Row ${spot.rowLabel} is one of the first rows you reach.`
      : `Continue to Row ${spot.rowLabel} (deeper into the lot).`
  )
  steps.push(`Your spot is number ${spot.number} in Row ${spot.rowLabel}.`)
  return steps
}

export default function SpotDetailPanel({ spot, lot, onClose, onReserve }) {
  if (!spot) return null

  const zone = ZONE_META[spot.zone]
  const directions = buildDirections(spot)
  const walkMins = Math.max(1, Math.round((spot.row + 1) * 0.4))

  return (
    <div style={{
      background: '#fff',
      border: '2px solid #00b894',
      borderRadius: '14px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 30px rgba(0,184,148,0.18)',
      animation: 'slideDown 0.25s ease',
    }}>
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '12px',
            background: zone.color + '20', color: zone.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
          }}>
            {zone.icon}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#1a1a2e' }}>Spot {spot.id}</h3>
              <span style={{
                background: '#d4edda', color: '#155724',
                fontSize: '0.72rem', fontWeight: 700,
                padding: '3px 10px', borderRadius: '20px',
              }}>
                AVAILABLE
              </span>
            </div>
            <div style={{ color: '#636e72', fontSize: '0.88rem', marginTop: '2px' }}>
              {zone.label} Zone · {lot.name}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: '#f1f3f5', border: 'none', borderRadius: '8px',
          width: 32, height: 32, cursor: 'pointer', color: '#636e72', fontSize: '1.1rem',
        }}>
          ✕
        </button>
      </div>

      {/* Quick facts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '1.3rem' }}>
        {[
          { label: 'Zone', value: zone.label },
          { label: 'Row', value: spot.rowLabel },
          { label: 'Position', value: '#' + spot.number },
          { label: 'Price', value: lot.pricePerHour + ' LYD/hr' },
          { label: 'Walk from gate', value: '~' + walkMins + ' min' },
        ].map((f) => (
          <div key={f.label} style={{ background: '#f8f9fa', borderRadius: '10px', padding: '10px 12px' }}>
            <div style={{ fontSize: '0.72rem', color: '#b2bec3' }}>{f.label}</div>
            <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem' }}>{f.value}</div>
          </div>
        ))}
      </div>

      {/* Animated route map */}
      <div style={{ marginTop: '1.3rem' }}>
        <RouteToSpot spot={spot} />
      </div>

      {/* Directions to the spot */}
      <div>
        <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '10px', fontSize: '0.95rem' }}>
          📍 How to reach this spot
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {directions.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: 22, height: 22, borderRadius: '50%',
                background: i === directions.length - 1 ? '#00b894' : '#1a1a2e',
                color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
              }}>
                {i === directions.length - 1 ? '★' : i + 1}
              </div>
              <span style={{ color: '#636e72', fontSize: '0.9rem', lineHeight: 1.4 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reserve */}
      <button onClick={() => onReserve(spot)} style={{
        marginTop: '1.5rem', width: '100%', padding: '13px',
        background: '#00b894', color: '#fff', border: 'none',
        borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
      }}>
        Reserve Spot {spot.id} →
      </button>
    </div>
  )
}
