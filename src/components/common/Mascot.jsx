// "Rukna the Pin" — Rakna's friendly animated mascot (the map-pin brought to life).
// Pure SVG + CSS (see global.css mascot-* keyframes). Theme-aware, RTL-safe, tiny.
//
//   mood: 'idle'  -> gentle bob + blink
//         'wave'  -> also waves its hand (greetings)
//         'thinking' -> bob + blink + "thinking" dots (AI is answering)
export default function Mascot({ size = 120, mood = 'idle', style }) {
  const waving = mood === 'wave'
  const thinking = mood === 'thinking'

  return (
    <svg
      width={size} height={size} viewBox="0 0 120 150"
      style={style} role="img" aria-label="Rukna"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="rukna-shine" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy="140" rx="26" ry="6" fill="#0F0E0E" opacity="0.12" />

      {/* everything bobs together */}
      <g className="mascot-bob">
        {/* waving hand (left side) */}
        <g className={waving ? 'mascot-hand' : ''}>
          <line x1="22" y1="74" x2="9" y2="64" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="7" cy="61" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
        </g>
        {/* right arm (resting) */}
        <line x1="98" y1="74" x2="109" y2="80" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="111" cy="82" r="5.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />

        {/* pin body (teardrop) */}
        <path
          d="M60 132 C 38 100, 20 82, 20 52 A 40 40 0 1 1 100 52 C 100 82 82 100 60 132 Z"
          fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2.5"
        />
        <path
          d="M60 132 C 38 100, 20 82, 20 52 A 40 40 0 1 1 100 52 C 100 82 82 100 60 132 Z"
          fill="url(#rukna-shine)"
        />

        {/* little "P" cap badge on top */}
        <circle cx="60" cy="16" r="11" fill="#0F0E0E" />
        <text x="60" y="21" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--brand)" fontFamily="Tajawal, system-ui, sans-serif">P</text>

        {/* white face plate */}
        <circle cx="60" cy="50" r="27" fill="#FFFFFF" />

        {/* eyes (blink) */}
        <circle className="mascot-eye" cx="50" cy="48" r="4.6" fill="#0F0E0E" />
        <circle className="mascot-eye" cx="70" cy="48" r="4.6" fill="#0F0E0E" />
        {/* cheeks */}
        <circle cx="44" cy="58" r="3.5" fill="var(--brand)" opacity="0.5" />
        <circle cx="76" cy="58" r="3.5" fill="var(--brand)" opacity="0.5" />
        {/* smile */}
        <path d="M50 60 Q60 69 70 60" fill="none" stroke="#0F0E0E" strokeWidth="3" strokeLinecap="round" />

        {/* thinking dots */}
        {thinking && (
          <g>
            <circle className="mascot-dot" cx="50" cy="34" r="2.6" fill="#0F0E0E" style={{ animation: 'mascotThink 1.1s ease-in-out 0s infinite' }} />
            <circle className="mascot-dot" cx="60" cy="34" r="2.6" fill="#0F0E0E" style={{ animation: 'mascotThink 1.1s ease-in-out 0.2s infinite' }} />
            <circle className="mascot-dot" cx="70" cy="34" r="2.6" fill="#0F0E0E" style={{ animation: 'mascotThink 1.1s ease-in-out 0.4s infinite' }} />
          </g>
        )}
      </g>
    </svg>
  )
}
