import { Link } from 'react-router-dom'

const s = {
  nav: {
    background: '#1a1a2e',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  logo: {
    color: '#00b894',
    fontWeight: 700,
    fontSize: '1.2rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  links: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  link: { color: '#dfe6e9', textDecoration: 'none', fontSize: '0.95rem' },
  btn: {
    background: '#00b894',
    color: '#fff',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
}

export default function Navbar() {
  return (
    <nav style={s.nav}>
      <Link to="/" style={s.logo}>🅿 Bourguiba Parking</Link>
      <div style={s.links}>
        <Link to="/map" style={s.link}>Map</Link>
        <Link to="/my-reservations" style={s.link}>Reservations</Link>
        <Link to="/my-vehicles" style={s.link}>🚗 Vehicles</Link>
        <Link to="/loyalty" style={{ ...s.link, color: '#fdcb6e' }}>🏆 Points</Link>
        <Link to="/login" style={s.link}>Login</Link>
        <Link to="/register" style={s.btn}>Sign Up</Link>
      </div>
    </nav>
  )
}

