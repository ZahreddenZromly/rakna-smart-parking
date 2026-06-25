import { useNavigate } from 'react-router-dom'
import { C, circleBtn } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'

export default function TopBar({ title, onBack, right }) {
  const navigate = useNavigate()
  const { isRTL } = useSettings()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 0 16px',
    }}>
      <button onClick={onBack || (() => navigate(-1))} style={circleBtn} aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.black} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: C.black }}>{title}</span>
      <div style={{ width: 46, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  )
}
