import { C, R } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'

// Realistic top-down car (matches the reference image: blue sedan seen from above)
function TopCar({ color = '#2D9CDB', reserved }) {
  const body = reserved ? '#F2A33C' : color
  const dark = reserved ? '#B9742020' : '#1b2a3a'
  return (
    <svg viewBox="0 0 60 104" width="46" height="80" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={'g' + body.replace('#', '')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={body} stopOpacity="0.85" />
          <stop offset="0.5" stopColor={body} />
          <stop offset="1" stopColor={body} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* side mirrors */}
      <rect x="2" y="40" width="8" height="9" rx="3" fill={body} />
      <rect x="50" y="40" width="8" height="9" rx="3" fill={body} />
      {/* body */}
      <rect x="8" y="4" width="44" height="96" rx="20" fill={`url(#g${body.replace('#', '')})`} stroke="rgba(0,0,0,0.12)" />
      {/* windshield (front) */}
      <path d="M14 30 Q30 20 46 30 L43 44 Q30 39 17 44 Z" fill={dark} opacity="0.92" />
      {/* rear window */}
      <path d="M16 74 Q30 80 44 74 L42 62 Q30 67 18 62 Z" fill={dark} opacity="0.85" />
      {/* roof */}
      <rect x="17" y="46" width="26" height="14" rx="5" fill={dark} opacity="0.18" />
      {/* headlights */}
      <rect x="12" y="6" width="8" height="4" rx="2" fill="#fff" opacity="0.8" />
      <rect x="40" y="6" width="8" height="4" rx="2" fill="#fff" opacity="0.8" />
    </svg>
  )
}

function Bay({ spot, selected, onSelect }) {
  const { t } = useSettings()
  const taken = spot.status !== 'available'

  if (taken) {
    return (
      <div title={`${spot.id} — ${spot.status}`} style={{ height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TopCar reserved={spot.status === 'reserved'} />
      </div>
    )
  }

  // available -> card (like the reference image)
  return (
    <div
      onClick={() => onSelect(spot)}
      style={{
        height: 92, borderRadius: R.md, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: selected ? '#D6E9FF' : C.white,
        border: '1.5px solid ' + (selected ? '#0984E3' : C.greyMid),
        boxShadow: selected ? '0 0 0 3px rgba(9,132,227,0.25)' : 'none',
        transition: 'all 0.12s', userSelect: 'none',
      }}
    >
      <div style={{ fontWeight: 700, color: C.black, fontSize: '0.92rem' }}>{spot.id}</div>
      <div style={{ fontSize: '0.74rem', color: selected ? '#0984E3' : C.textMuted, marginTop: 2 }}>
        {selected ? '✓ ' + t('selected') : t('available')}
      </div>
    </div>
  )
}

export default function CarLanes({ spots, selectedSpot, onSelect }) {
  const left = spots.filter((s) => s.col === 0)
  const right = spots.filter((s) => s.col === 1)

  return (
    <div style={{ background: C.grey, borderRadius: R.card, padding: '16px 14px' }}>
      {/* drive direction */}
      <div style={{ textAlign: 'center', color: C.textMuted, fontSize: '0.9rem', letterSpacing: 6, marginBottom: 6 }}>⌃ ⌃ ⌃</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 30px 1fr', gap: 12, alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {left.map((s) => <Bay key={s.id} spot={s} selected={selectedSpot?.id === s.id} onSelect={onSelect} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', color: C.greyMid }}>
          {Array.from({ length: Math.max(left.length, right.length) + 1 }).map((_, i) => (
            <span key={i} style={{ fontSize: '1.1rem', opacity: 0.6 }}>⌄</span>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {right.map((s) => <Bay key={s.id} spot={s} selected={selectedSpot?.id === s.id} onSelect={onSelect} />)}
        </div>
      </div>
    </div>
  )
}
