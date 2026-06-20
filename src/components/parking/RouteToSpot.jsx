import { useState, useEffect } from 'react'
import { C, R } from '../../styles/theme'
import { ZONE_META } from '../../utils/spotsData'
import { useSettings } from '../../context/SettingsContext'

// ---- geometry for the mini-map ----
const VW = 300, VH = 340
const LANE_X = 150
const ENTRANCE = { x: 110, y: 322 }
const EXIT = { x: 190, y: 322 }

function geometry(spot) {
  const rowClamped = Math.min(spot.row, 5)
  const spotY = 70 + rowClamped * 40
  const spotX = spot.col === 0 ? 78 : 222
  // car path: entrance -> up the lane -> across to the spot
  const path = `M${ENTRANCE.x},${ENTRANCE.y} L${LANE_X},${ENTRANCE.y} L${LANE_X},${spotY} L${spotX},${spotY}`
  return { spotX, spotY, path }
}

export default function RouteToSpot({ spot, announce }) {
  const { t, speak } = useSettings()
  const [runId, setRunId] = useState(0)
  const zone = ZONE_META[spot.zone]
  const { spotX, spotY, path } = geometry(spot)

  // estimated distance + walking ETA
  const distance = 20 + (spot.row + 1) * 6 + (spot.col === 1 ? 4 : 0)
  const etaMin = Math.max(1, Math.round(distance / 70)) // ~70 m/min walking

  const turn = spot.col === 0 ? t('nav_turn_left') : t('nav_turn_right')
  const steps = [
    { icon: '▶', text: `${t('nav_enter_via')} ${zone.entrance}`, dist: '' },
    { icon: '↑', text: `${t('nav_straight')} ${spot.row + 1}`, dist: `${distance - 8} m` },
    { icon: spot.col === 0 ? '↰' : '↱', text: turn, dist: '8 m' },
    { icon: '★', text: `${t('nav_arrive')} ${spot.id}`, dist: '' },
  ]

  useEffect(() => {
    if (announce) speak(`${t('nav_arrive')} ${spot.id}. ${steps.map((s) => s.text).join('. ')}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot.id])

  return (
    <div style={{ background: C.grey, borderRadius: R.md, padding: 14 }}>
      {/* header: distance + ETA, like a nav app */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 800, color: C.black, fontSize: '1.05rem' }}>{etaMin} {t('nav_min')} · {distance} m</div>
          <div style={{ fontSize: '0.74rem', color: C.textMuted }}>{t('nav_walk')} → {spot.id}</div>
        </div>
        <button onClick={() => setRunId((n) => n + 1)} style={{
          background: C.ink, color: C.onInk, border: 'none', borderRadius: R.pill,
          padding: '7px 16px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
        }}>↻ {t('replay')}</button>
      </div>

      {/* mini-map */}
      <svg key={runId} viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: 'auto', display: 'block', background: '#EAECEF', borderRadius: 12 }} role="img" aria-label={`${t('route_to_spot')} ${spot.id}`}>
        {/* zone floor */}
        <rect x="12" y="14" width={VW - 24} height={VH - 28} rx="14" fill="#E1E4E8" stroke={zone.color + '55'} strokeWidth="2" />
        <text x="24" y="36" fontSize="12" fontWeight="700" fill={zone.color}>{t(zone.key)}</text>

        {/* drive lane */}
        <rect x={LANE_X - 13} y="48" width="26" height={ENTRANCE.y - 48} rx="6" fill="#D3D8DE" />
        <line x1={LANE_X} y1="58" x2={LANE_X} y2={ENTRANCE.y - 6} stroke="#AAB2BD" strokeWidth="2" strokeDasharray="6 8" />

        {/* entrance (green) + exit (red) */}
        <rect x={ENTRANCE.x - 22} y={ENTRANCE.y + 4} width="44" height="10" rx="3" fill="#2BBF6A" />
        <text x={ENTRANCE.x} y={ENTRANCE.y + 30} fontSize="9" fontWeight="700" fill="#1A8F4C" textAnchor="middle">{t('entrance')}</text>
        <rect x={EXIT.x - 22} y={EXIT.y + 4} width="44" height="10" rx="3" fill="#E8503A" />
        <text x={EXIT.x} y={EXIT.y + 30} fontSize="9" fontWeight="700" fill="#C23A26" textAnchor="middle">{t('exit')}</text>

        {/* route */}
        <path d={path} fill="none" stroke={zone.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="500" strokeDashoffset="500">
          <animate attributeName="stroke-dashoffset" from="500" to="0" dur="2.4s" fill="freeze" />
        </path>

        {/* target spot */}
        <rect x={spotX - 13} y={spotY - 11} width="26" height="22" rx="4" fill={zone.color} />
        <text x={spotX} y={spotY + 4} fontSize="8" fontWeight="700" fill="#fff" textAnchor="middle">{spot.id}</text>
        <circle cx={spotX} cy={spotY} r="16" fill="none" stroke={zone.color} strokeWidth="2.5">
          <animate attributeName="r" values="14;22;14" dur="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0;0.9" dur="1.4s" repeatCount="indefinite" />
        </circle>

        {/* moving marker */}
        <g>
          <circle r="5" fill={zone.color} stroke="#fff" strokeWidth="1.6" />
          <animateMotion dur="2.4s" fill="freeze" path={path} rotate="0" />
        </g>
        <circle cx={ENTRANCE.x} cy={ENTRANCE.y} r="5" fill="#0984E3" stroke="#fff" strokeWidth="2" />
      </svg>

      {/* turn-by-turn steps */}
      <div style={{ marginTop: 12 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < steps.length - 1 ? '1px solid ' + C.greyMid : 'none' }}>
            <span style={{
              minWidth: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i === steps.length - 1 ? zone.color : C.ink, color: '#fff', fontSize: '1rem', fontWeight: 700,
            }}>{s.icon}</span>
            <span style={{ flex: 1, color: C.black, fontSize: '0.9rem', fontWeight: 500 }}>{s.text}</span>
            {s.dist && <span style={{ color: C.textMuted, fontSize: '0.8rem', fontWeight: 600 }}>{s.dist}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
