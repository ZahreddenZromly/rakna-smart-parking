// "ركنوش" (Raknoush the Pin) — Rakna's friendly animated mascot.
// Pure SVG + CSS (mascot-* keyframes in global.css). Theme-aware, RTL-safe, tiny.
//
// Moods (alias in []):
//   idle · wave · thinking · happy · sad · worried        (original set)
//   excited · winking[wink] · cool · love · surprised ·
//   determined · helpful · smart · traveler ·
//   driving[happy-driver] · sleepy · party · shopping · winter
//
// Unknown moods fall back to 'idle', so it is always safe to pass anything.

const INK = '#0F0E0E'

// Per-mood feature map. Keep flags small & composable.
const CONF = {
  idle:       { eyes: 'dots',      mouth: 'smile', anim: 'bob' },
  wave:       { eyes: 'dots',      mouth: 'smile', anim: 'bob', wave: true },
  thinking:   { eyes: 'dots',      mouth: 'smile', anim: 'bob', think: true },
  happy:      { eyes: 'happy',     mouth: 'open',  anim: 'happy', sparkle: true, wave: true },
  excited:    { eyes: 'happy',     mouth: 'open',  anim: 'happy', sparkle: true, armsUp: true, motion: true },
  winking:    { eyes: 'wink',      mouth: 'open',  anim: 'bob', okHand: true },
  cool:       { eyes: 'dots',      mouth: 'smirk', anim: 'bob', sunglasses: true, thumbsUp: true },
  love:       { eyes: 'heart',     mouth: 'open',  anim: 'happy', hearts: true, handsCheeks: true },
  surprised:  { eyes: 'surprised', mouth: 'o',     anim: 'worried', motion: true, browsUp: true },
  determined: { eyes: 'dots',      mouth: 'smirk', anim: 'bob', browsDown: true, cape: true, fist: true },
  helpful:    { eyes: 'dots',      mouth: 'smile', anim: 'bob', headset: true, point: true },
  smart:      { eyes: 'dots',      mouth: 'smile', anim: 'bob', glasses: true, bowtie: true, fingerUp: true },
  traveler:   { eyes: 'happy',     mouth: 'smile', anim: 'bob', bucketHat: true, camera: true, hidePCap: true },
  driving:    { eyes: 'happy',     mouth: 'smile', anim: 'bob', wheel: true },
  sleepy:     { eyes: 'sleepy',    mouth: 'calm',  anim: 'sad', nightcap: true, zzz: true, hidePCap: true, noCheeks: true },
  party:      { eyes: 'happy',     mouth: 'open',  anim: 'happy', partyHat: true, confetti: true, blower: true },
  shopping:   { eyes: 'happy',     mouth: 'smile', anim: 'bob', bags: true },
  winter:     { eyes: 'happy',     mouth: 'calm',  anim: 'bob', beanie: true, scarf: true, snow: true, hidePCap: true, armsOut: true },
  flower:     { eyes: 'happy',     mouth: 'open',  anim: 'bob', flower: true },
  waiting:    { eyes: 'dots',      mouth: 'calm',  anim: 'bob', clock: true },
  sad:        { eyes: 'dots',      mouth: 'frown', anim: 'sad', brows: 'sad', tear: true, noGlow: true, noCheeks: true },
  worried:    { eyes: 'dots',      mouth: 'o',     anim: 'worried', brows: 'worried', sweat: true, noGlow: true, noCheeks: true, smallO: true },
}
const ALIAS = { wink: 'winking', 'happy-driver': 'driving' }

function heartPath(cx, cy, s = 1) {
  return `M${cx} ${cy + 4 * s} C ${cx - 6 * s} ${cy - 3 * s}, ${cx - 6 * s} ${cy - 9 * s}, ${cx} ${cy - 4 * s} `
       + `C ${cx + 6 * s} ${cy - 9 * s}, ${cx + 6 * s} ${cy - 3 * s}, ${cx} ${cy + 4 * s} Z`
}

function Eyes({ type }) {
  switch (type) {
    case 'happy':
      return (
        <g stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round">
          <path d="M44 50 Q50 43 56 50" />
          <path d="M64 50 Q70 43 76 50" />
        </g>
      )
    case 'sleepy':
      return (
        <g stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M44 49 Q50 54 56 49" />
          <path d="M64 49 Q70 54 76 49" />
        </g>
      )
    case 'wink':
      return (
        <>
          <circle className="mascot-eye" cx="50" cy="48" r="4.6" fill={INK} />
          <path d="M64 48 Q70 43 76 48" stroke={INK} strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </>
      )
    case 'surprised':
      return (
        <>
          <circle cx="50" cy="48" r="5.8" fill={INK} />
          <circle cx="70" cy="48" r="5.8" fill={INK} />
          <circle cx="48.5" cy="46.5" r="1.6" fill="#FFF" />
          <circle cx="68.5" cy="46.5" r="1.6" fill="#FFF" />
        </>
      )
    case 'heart':
      return (
        <g fill="#E0245E">
          <path d={heartPath(50, 48, 1.05)} />
          <path d={heartPath(70, 48, 1.05)} />
        </g>
      )
    default:
      return (
        <>
          <circle className="mascot-eye" cx="50" cy="48" r="4.6" fill={INK} />
          <circle className="mascot-eye" cx="70" cy="48" r="4.6" fill={INK} />
        </>
      )
  }
}

function Mouth({ type, smallO }) {
  switch (type) {
    case 'open':
      return (
        <g>
          <path d="M50 58 Q60 73 70 58 Q60 64 50 58 Z" fill="#7A1F1F" />
          <path d="M55 65 Q60 70 65 65 Q60 67 55 65 Z" fill="#E74C3C" />
        </g>
      )
    case 'o':
      return <ellipse cx="60" cy="63" rx={smallO ? 4 : 5.4} ry={smallO ? 4 : 6.2} fill="#7A1F1F" />
    case 'smirk':
      return <path d="M51 61 Q62 67 70 58" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    case 'frown':
      return <path d="M50 64 Q60 56 70 64" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    case 'calm':
      return <path d="M52 61 Q60 66 68 61" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
    default:
      return <path d="M50 60 Q60 69 70 60" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
  }
}

const spark = (d, delay) => (
  <path className="mascot-spark" d={d} fill="var(--brand-dark)"
    style={{ animation: `mascotTwinkle 1.3s ease-in-out ${delay}s infinite` }} />
)

export default function Mascot({ size = 120, mood = 'idle', style }) {
  const key = ALIAS[mood] || mood
  const c = CONF[key] || CONF.idle
  const bodyClass = c.anim === 'happy' ? 'mascot-happy'
    : c.anim === 'sad' ? 'mascot-sad'
    : c.anim === 'worried' ? 'mascot-worried' : 'mascot-bob'

  const customArms = c.armsUp || c.thumbsUp || c.fist || c.point || c.wheel
    || c.bags || c.camera || c.handsCheeks || c.armsOut || c.okHand || c.fingerUp || c.blower || c.flower
  const showCheeks = !c.noCheeks

  return (
    <svg width={size} height={size} viewBox="0 0 120 150" style={style}
      role="img" aria-label="ركنوش" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rukna-shine" cx="38%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy="140" rx="26" ry="6" fill="#0B1A40" opacity="0.14" />

      {/* lively glow halo */}
      {!c.noGlow && (
        <circle className="mascot-glow" cx="60" cy="54" r="46" fill="var(--accent)" opacity="0.4" />
      )}

      {/* particles behind / around */}
      {c.sparkle && (
        <g>
          {spark('M16 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z', 0)}
          {spark('M100 22 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z', 0.4)}
          {spark('M104 58 l1.3 3.2 3.2 1.3 -3.2 1.3 -1.3 3.2 -1.3 -3.2 -3.2 -1.3 3.2 -1.3 Z', 0.8)}
        </g>
      )}
      {c.motion && (
        <g stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" opacity="0.85">
          <line x1="98" y1="30" x2="108" y2="24" /><line x1="100" y1="40" x2="111" y2="38" />
          <line x1="96" y1="50" x2="107" y2="52" />
        </g>
      )}
      {c.hearts && (
        <g fill="#E0245E">
          <path className="mascot-float" d={heartPath(98, 54, 1.6)} style={{ animation: 'mascotFloat 2.2s ease-in 0s infinite' }} />
          <path className="mascot-float" d={heartPath(106, 44, 1.1)} style={{ animation: 'mascotFloat 2.2s ease-in 0.7s infinite' }} />
          <path className="mascot-float" d={heartPath(92, 36, 1.3)} style={{ animation: 'mascotFloat 2.2s ease-in 1.3s infinite' }} />
        </g>
      )}
      {c.confetti && (
        <g>
          {[['#F2A900', 14, 28, 0], ['#2BCBBA', 26, 18, 0.5], ['#E0245E', 96, 22, 0.3],
            ['#6C5CE7', 104, 40, 0.9], ['#0984E3', 20, 50, 1.1], ['#F2A900', 100, 60, 0.7]].map(([col, x, y, d], i) => (
            <rect key={i} className="mascot-confetti" x={x} y={y} width="4" height="6" rx="1" fill={col}
              style={{ animation: `mascotConfetti 1.8s ease-in ${d}s infinite` }} />
          ))}
        </g>
      )}
      {c.snow && (
        <g fill="#BFE3FF">
          {[[14, 30, 0], [104, 26, 0.6], [22, 60, 1.0], [100, 64, 0.4], [8, 90, 1.3]].map(([x, y, d], i) => (
            <circle key={i} className="mascot-snow" cx={x} cy={y} r="2.6"
              style={{ animation: `mascotSnow 2.4s linear ${d}s infinite` }} />
          ))}
        </g>
      )}
      {c.zzz && (
        <g fill="var(--brand-dark)" fontWeight="800" fontFamily="Tajawal, system-ui, sans-serif">
          <text className="mascot-zzz" x="86" y="40" fontSize="9" style={{ animation: 'mascotZzz 2.6s ease-in 0s infinite' }}>z</text>
          <text className="mascot-zzz" x="92" y="32" fontSize="12" style={{ animation: 'mascotZzz 2.6s ease-in 0.8s infinite' }}>Z</text>
          <text className="mascot-zzz" x="99" y="24" fontSize="15" style={{ animation: 'mascotZzz 2.6s ease-in 1.6s infinite' }}>Z</text>
        </g>
      )}
      {c.think && (
        <g>
          <circle className="mascot-dot" cx="50" cy="30" r="2.6" fill={INK} style={{ animation: 'mascotThink 1.1s ease-in-out 0s infinite' }} />
          <circle className="mascot-dot" cx="60" cy="30" r="2.6" fill={INK} style={{ animation: 'mascotThink 1.1s ease-in-out 0.2s infinite' }} />
          <circle className="mascot-dot" cx="70" cy="30" r="2.6" fill={INK} style={{ animation: 'mascotThink 1.1s ease-in-out 0.4s infinite' }} />
        </g>
      )}

      {/* waiting clock — ticks while Raknoush waits in line */}
      {c.clock && (
        <g>
          <circle cx="96" cy="28" r="9.5" fill="#FFF" stroke={INK} strokeWidth="2" />
          <circle cx="96" cy="28" r="1.6" fill={INK} />
          <line x1="96" y1="28" x2="96" y2="22" stroke={INK} strokeWidth="1.8" strokeLinecap="round"
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'mascotSpin 3s linear infinite' }} />
          <line x1="96" y1="28" x2="100.5" y2="28" stroke={INK} strokeWidth="1.8" strokeLinecap="round"
            style={{ transformBox: 'fill-box', transformOrigin: 'left', animation: 'mascotSpin 14s linear infinite' }} />
        </g>
      )}

      {/* cape (behind body) */}
      {c.cape && (
        <path d="M92 60 q34 6 26 44 q-16 -10 -30 -6 Z" fill="#E0312B" stroke="#B5231E" strokeWidth="1.5" />
      )}

      {/* everything bobs together */}
      <g className={bodyClass}>
        {/* ---- arms ---- */}
        {!customArms && (
          <>
            <g className={c.wave ? 'mascot-hand' : ''}>
              <line x1="22" y1="74" x2="9" y2="64" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
              <circle cx="7" cy="61" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            </g>
            <line x1="98" y1="74" x2="109" y2="80" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="111" cy="82" r="5.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
          </>
        )}
        {c.armsUp && (
          <g className="mascot-shake" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'mascotShake 0.9s ease-in-out infinite' }}>
            <line x1="24" y1="72" x2="10" y2="56" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="8" cy="53" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            <line x1="96" y1="72" x2="110" y2="56" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="112" cy="53" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
          </g>
        )}
        {c.armsOut && (
          <>
            <line x1="24" y1="74" x2="8" y2="70" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="6" cy="69" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            <line x1="96" y1="74" x2="112" y2="70" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="114" cy="69" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
          </>
        )}
        {c.thumbsUp && (
          <>
            <line x1="22" y1="74" x2="9" y2="64" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="7" cy="61" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            <line x1="98" y1="76" x2="108" y2="66" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="110" cy="63" r="6.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            <rect x="107.5" y="52" width="5" height="9" rx="2.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="1.6" />
          </>
        )}
        {c.okHand && (
          <>
            <g className="mascot-hand">
              <line x1="22" y1="74" x2="9" y2="60" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
              <circle cx="7" cy="57" r="7" fill="none" stroke="var(--brand)" strokeWidth="3.5" />
            </g>
            <line x1="98" y1="74" x2="109" y2="80" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="111" cy="82" r="5.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
          </>
        )}
        {c.fist && (
          <>
            <line x1="22" y1="74" x2="12" y2="82" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="10" cy="84" r="5.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            <line x1="96" y1="70" x2="104" y2="50" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="105" cy="46" r="7" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
          </>
        )}
        {(c.point || c.fingerUp) && (
          <>
            <g className={c.point ? 'mascot-hand' : ''}>
              <line x1="22" y1="74" x2="9" y2="64" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
              <circle cx="7" cy="61" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            </g>
            <line x1="98" y1="72" x2="106" y2="52" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="107" cy="48" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
          </>
        )}
        {c.handsCheeks && (
          <>
            <line x1="30" y1="78" x2="34" y2="64" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="35" cy="60" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            <line x1="90" y1="78" x2="86" y2="64" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="85" cy="60" r="6" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
          </>
        )}

        {/* pin body (teardrop) */}
        <path d="M60 132 C 38 100, 20 82, 20 52 A 40 40 0 1 1 100 52 C 100 82 82 100 60 132 Z"
          fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2.5" />
        <path d="M60 132 C 38 100, 20 82, 20 52 A 40 40 0 1 1 100 52 C 100 82 82 100 60 132 Z"
          fill="url(#rukna-shine)" />

        {/* held props that sit in front of the body */}
        {c.wheel && (
          <g>
            <line x1="36" y1="84" x2="48" y2="92" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <line x1="84" y1="84" x2="72" y2="92" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="60" cy="100" r="18" fill="none" stroke={INK} strokeWidth="5" />
            <circle cx="60" cy="100" r="5.5" fill={INK} />
            <line x1="60" y1="82" x2="60" y2="95" stroke={INK} strokeWidth="4" />
            <line x1="45" y1="105" x2="56" y2="101" stroke={INK} strokeWidth="4" />
            <line x1="75" y1="105" x2="64" y2="101" stroke={INK} strokeWidth="4" />
          </g>
        )}
        {c.bags && (
          <>
            <line x1="24" y1="74" x2="18" y2="90" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <g>
              <rect x="6" y="92" width="20" height="22" rx="2" fill="#F2C200" stroke="#C99A00" strokeWidth="1.5" />
              <path d="M11 92 q5 -7 10 0" fill="none" stroke="#C99A00" strokeWidth="2" />
            </g>
            <line x1="96" y1="74" x2="102" y2="90" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <g>
              <rect x="94" y="94" width="20" height="22" rx="2" fill="#36C98E" stroke="#1E9E6C" strokeWidth="1.5" />
              <path d="M99 94 q5 -7 10 0" fill="none" stroke="#1E9E6C" strokeWidth="2" />
            </g>
          </>
        )}
        {c.camera && (
          <>
            <line x1="96" y1="74" x2="92" y2="92" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <g>
              <rect x="78" y="90" width="30" height="20" rx="3" fill="#222" />
              <rect x="86" y="86" width="10" height="6" rx="1.5" fill="#222" />
              <circle cx="93" cy="100" r="6.5" fill="#444" stroke="#777" strokeWidth="2" />
              <circle cx="93" cy="100" r="3" fill="#9AD" />
              <circle cx="103" cy="94" r="1.6" fill="#F2A900" />
            </g>
          </>
        )}
        {c.blower && (
          <>
            <line x1="98" y1="74" x2="108" y2="78" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="110" cy="79" r="5.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            <path d="M70 62 q12 -2 22 -6" stroke="#E0245E" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M92 56 l10 -3 -2 8 Z" fill="#F2A900" />
          </>
        )}
        {c.flower && (
          <>
            {/* left hand resting */}
            <line x1="22" y1="74" x2="11" y2="80" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="9" cy="82" r="5.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            {/* right arm holding a flower up */}
            <line x1="98" y1="74" x2="106" y2="60" stroke="var(--brand-dark)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="107" cy="58" r="5.5" fill="var(--brand)" stroke="var(--brand-dark)" strokeWidth="2" />
            <line x1="107" y1="58" x2="107" y2="40" stroke="#2E9E5B" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M107 50 q-7 -2 -9 -7 q7 0 9 5 Z" fill="#2E9E5B" />
            <g fill="#FF5C8A">
              <circle cx="107" cy="32" r="3.6" /><circle cx="112" cy="37" r="3.6" />
              <circle cx="110" cy="43" r="3.6" /><circle cx="104" cy="43" r="3.6" />
              <circle cx="102" cy="37" r="3.6" />
            </g>
            <circle cx="107" cy="38" r="3" fill="#F2C200" />
          </>
        )}

        {/* "P" cap badge (unless a hat replaces it) */}
        {!c.hidePCap && (
          <>
            <circle cx="60" cy="16" r="11" fill="#0F0E0E" />
            <text x="60" y="21" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--brand)" fontFamily="Tajawal, system-ui, sans-serif">P</text>
          </>
        )}

        {/* white face plate */}
        <circle cx="60" cy="50" r="27" fill="#FFFFFF" />

        {/* brows */}
        {c.brows === 'sad' && (
          <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
            <line x1="44" y1="46" x2="53" y2="41" /><line x1="76" y1="46" x2="67" y2="41" />
          </g>
        )}
        {c.brows === 'worried' && (
          <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
            <line x1="44" y1="45" x2="53" y2="41" /><line x1="76" y1="45" x2="67" y2="41" />
          </g>
        )}
        {c.browsDown && (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round">
            <line x1="44" y1="40" x2="54" y2="44" /><line x1="76" y1="40" x2="66" y2="44" />
          </g>
        )}
        {c.browsUp && (
          <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
            <line x1="45" y1="39" x2="55" y2="38" /><line x1="75" y1="39" x2="65" y2="38" />
          </g>
        )}

        {/* eyes */}
        {!c.sunglasses && <Eyes type={c.eyes} />}

        {/* cheeks */}
        {showCheeks && (
          <>
            <circle cx="44" cy="58" r="3.5" fill="var(--brand)" opacity="0.5" />
            <circle cx="76" cy="58" r="3.5" fill="var(--brand)" opacity="0.5" />
          </>
        )}

        {/* mouth */}
        <Mouth type={c.mouth} smallO={c.smallO} />

        {/* tear / sweat */}
        {c.tear && (
          <path d="M48 53 q-3.2 5.5 0 8 q3.2 -2.5 0 -8 Z" fill="#4FC3F7" style={{ animation: 'mascotTear 2.4s ease-in-out infinite' }} />
        )}
        {c.sweat && (
          <path d="M83 39 q-3.2 5.5 0 8 q3.2 -2.5 0 -8 Z" fill="#4FC3F7" style={{ animation: 'mascotTear 1.9s ease-in-out infinite' }} />
        )}

        {/* ---- face-worn accessories (front) ---- */}
        {c.sunglasses && (
          <g>
            <rect x="40" y="43" width="16" height="11" rx="3" fill={INK} />
            <rect x="64" y="43" width="16" height="11" rx="3" fill={INK} />
            <line x1="56" y1="46" x2="64" y2="46" stroke={INK} strokeWidth="3" />
            <line x1="40" y1="45" x2="33" y2="43" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <line x1="80" y1="45" x2="87" y2="43" stroke={INK} strokeWidth="3" strokeLinecap="round" />
            <rect x="42" y="45" width="5" height="3" rx="1.5" fill="#FFF" opacity="0.35" />
          </g>
        )}
        {c.glasses && (
          <g fill="none" stroke={INK} strokeWidth="2.6">
            <circle cx="50" cy="48" r="8" /><circle cx="70" cy="48" r="8" />
            <line x1="58" y1="48" x2="62" y2="48" />
            <line x1="42" y1="47" x2="35" y2="45" strokeLinecap="round" />
            <line x1="78" y1="47" x2="85" y2="45" strokeLinecap="round" />
          </g>
        )}
        {c.headset && (
          <g>
            <path d="M30 50 A30 30 0 0 1 90 50" fill="none" stroke={INK} strokeWidth="4" />
            <rect x="26" y="48" width="9" height="14" rx="3" fill={INK} />
            <rect x="85" y="48" width="9" height="14" rx="3" fill={INK} />
            <path d="M30 60 q-4 10 8 12" fill="none" stroke={INK} strokeWidth="3" />
            <circle cx="40" cy="73" r="3" fill={INK} />
          </g>
        )}

        {/* ---- hats / headwear (front, on top) ---- */}
        {c.bowtie && (
          <g>
            <path d="M60 92 l-9 -5 0 10 Z" fill={INK} />
            <path d="M60 92 l9 -5 0 10 Z" fill={INK} />
            <circle cx="60" cy="92" r="2.6" fill={INK} />
          </g>
        )}
        {c.scarf && (
          <g>
            <path d="M34 78 q26 14 52 0 l0 9 q-26 12 -52 0 Z" fill="#E0312B" stroke="#B5231E" strokeWidth="1.5" />
            <path d="M78 86 l8 22 -9 2 -5 -20 Z" fill="#E0312B" stroke="#B5231E" strokeWidth="1.5" />
          </g>
        )}
        {c.bucketHat && (
          <g>
            <path d="M30 36 q30 -16 60 0 l-4 4 q-26 -10 -52 0 Z" fill="#CDB892" stroke="#A8946F" strokeWidth="1.5" />
            <path d="M37 36 q23 -22 46 0 Z" fill="#D8C7A2" stroke="#A8946F" strokeWidth="1.5" />
          </g>
        )}
        {c.nightcap && (
          <g>
            <path d="M34 34 q26 -26 52 -6 q-14 4 -22 14 q-16 -6 -30 -8 Z" fill="var(--brand-dark)" />
            <circle cx="86" cy="28" r="6" fill="#FFF" />
          </g>
        )}
        {c.partyHat && (
          <g>
            <path d="M48 12 l-12 22 26 0 Z" fill="#E0245E" stroke="#B51E4C" strokeWidth="1.5" transform="rotate(-12 48 24)" />
            <circle cx="44" cy="6" r="3.5" fill="#F2A900" />
            <g transform="rotate(-12 48 24)" stroke="#F2A900" strokeWidth="2">
              <line x1="38" y1="28" x2="58" y2="28" /><line x1="40" y1="22" x2="56" y2="22" />
            </g>
          </g>
        )}
        {c.beanie && (
          <g>
            <path d="M32 40 q28 -34 56 0 Z" fill="var(--brand-dark)" />
            <rect x="30" y="36" width="60" height="9" rx="4.5" fill="#16307a" />
            <circle cx="60" cy="8" r="6" fill="#16307a" />
          </g>
        )}
      </g>
    </svg>
  )
}
