// ============================================================
// DESIGN SYSTEM — Rakna (ركنة) Smart Parking
// Colors are CSS variables so light/dark theme works app-wide.
// Actual values live in global.css (:root and [data-theme="dark"]).
// ============================================================

export const C = {
  // brand (kept the legacy `yellow*` keys so every import keeps working —
  // the values are now the deep-blue brand tokens)
  yellow: 'var(--brand)',
  yellowDark: 'var(--brand-dark)',
  yellowSoft: 'var(--brand-soft)',
  brand: 'var(--brand)',
  brandDark: 'var(--brand-dark)',
  brandSoft: 'var(--brand-soft)',
  accent: 'var(--accent)',
  // semantic (adapt to theme)
  black: 'var(--text)',        // primary text / ink-on-surface
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  textSoft: 'var(--text-soft)',
  white: 'var(--surface)',     // card surfaces
  grey: 'var(--bg)',           // page background
  greyMid: 'var(--border)',
  frame: 'var(--frame)',       // area around the phone frame
  // stable (do NOT invert) — for branded dark surfaces
  ink: 'var(--ink)',
  onInk: 'var(--on-ink)',
  // status (fixed)
  available: '#34C759',
  occupied: '#9A9A9A',
  reserved: '#FF9F0A',
  danger: '#FF3B30',
}

export const FONT = "'Tajawal', system-ui, sans-serif"

export const R = { card: '26px', md: '18px', sm: '14px', pill: '999px' }

export const SHADOW = {
  card: '0 14px 34px rgba(11,26,64,0.12)',
  soft: '0 6px 18px rgba(11,26,64,0.07)',
  yellow: '0 10px 26px rgba(79,123,245,0.42)',  // legacy key — now a blue glow
  brand: '0 10px 26px rgba(79,123,245,0.42)',
  float: '0 18px 44px rgba(11,26,64,0.18)',
}

export const pillBtn = (active) => ({
  padding: '12px 22px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
  fontWeight: 600, fontFamily: FONT, fontSize: '0.9rem',
  background: active ? C.yellow : C.grey, color: C.black, whiteSpace: 'nowrap',
})

export const primaryBtn = {
  width: '100%', padding: '17px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
  fontWeight: 700, fontFamily: FONT, fontSize: '1rem',
  background: C.yellow, color: C.ink, boxShadow: SHADOW.yellow,
}

export const circleBtn = {
  width: 46, height: 46, borderRadius: '50%', border: 'none',
  background: C.white, boxShadow: SHADOW.soft, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.1rem', color: C.black,
}
