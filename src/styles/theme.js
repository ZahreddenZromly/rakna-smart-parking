// ============================================================
// DESIGN SYSTEM — Rakna (ركنة) Smart Parking
// Colors are CSS variables so light/dark theme works app-wide.
// Actual values live in global.css (:root and [data-theme="dark"]).
// ============================================================

export const C = {
  // brand
  yellow: 'var(--brand)',
  yellowDark: 'var(--brand-dark)',
  yellowSoft: 'var(--brand-soft)',
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
  card: '0 12px 30px rgba(15,14,14,0.10)',
  soft: '0 6px 18px rgba(15,14,14,0.06)',
  yellow: '0 10px 24px rgba(249,221,78,0.45)',
  float: '0 16px 40px rgba(15,14,14,0.14)',
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
