const s = {
  footer: {
    background: '#1a1a2e',
    color: '#b2bec3',
    textAlign: 'center',
    padding: '2rem',
    marginTop: 'auto',
    fontSize: '0.9rem',
  },
}

export default function Footer() {
  return (
    <footer style={s.footer}>
      <p>🅿 Bourguiba Smart Parking — Tripoli, Libya</p>
      <p style={{ marginTop: '4px', opacity: 0.6 }}>© 2025 All rights reserved</p>
    </footer>
  )
}

