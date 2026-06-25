import { FONT } from '../../styles/theme'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      color: 'var(--text-muted)',
      textAlign: 'center',
      padding: 'clamp(16px, 3vw, 32px) clamp(16px, 4vw, 48px)',
      marginTop: 'auto',
      fontSize: '0.85rem',
      fontFamily: FONT,
    }}>
      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-soft)' }}>
        🅿 Bourguiba Smart Parking — Tripoli, Libya
      </p>
      <p style={{ margin: '4px 0 0', opacity: 0.7 }}>
        © 2025 All rights reserved
      </p>
    </footer>
  )
}