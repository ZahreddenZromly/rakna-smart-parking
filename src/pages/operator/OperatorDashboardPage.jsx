import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { PARKING_LOTS, getAvailabilityStatus, STATUS_COLOR, STATUS_LABEL, getLotName, getLotAddress } from '../../utils/constants'
import { useSettings } from '../../context/SettingsContext'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import Icon from '../../components/common/Icon'
import MascotWelcome from '../../components/common/MascotWelcome'

const hourlyData = [
  { hour: '6AM', occupancy: 20 }, { hour: '7AM', occupancy: 45 },
  { hour: '8AM', occupancy: 72 }, { hour: '9AM', occupancy: 88 },
  { hour: '10AM', occupancy: 85 }, { hour: '11AM', occupancy: 78 },
  { hour: '12PM', occupancy: 90 }, { hour: '1PM', occupancy: 95 },
  { hour: '2PM', occupancy: 80 }, { hour: '3PM', occupancy: 75 },
  { hour: '4PM', occupancy: 88 }, { hour: '5PM', occupancy: 92 },
  { hour: '6PM', occupancy: 70 }, { hour: '7PM', occupancy: 50 },
]

const weekData = [
  { day: 'Mon', bookings: 42 }, { day: 'Tue', bookings: 55 },
  { day: 'Wed', bookings: 61 }, { day: 'Thu', bookings: 58 },
  { day: 'Fri', bookings: 80 }, { day: 'Sat', bookings: 75 },
  { day: 'Sun', bookings: 38 },
]

const TABS = ['Overview', 'Revenue', 'Details']

export default function OperatorDashboardPage() {
  const [tab, setTab] = useState('Overview')
  const navigate = useNavigate()
  const { t: tr, lang } = useSettings()
  const [searchParams] = useSearchParams()

  const lotId = searchParams.get('lot')
  const email = searchParams.get('email') || ''
  const lot = PARKING_LOTS.find(l => l.id === lotId) || null

  // If no valid lot, show error
  if (!lot) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FONT, background: C.grey, color: C.text }}>
        <Icon name="shield" size={48} color={C.textMuted} strokeWidth={1.5} />
        <p style={{ color: C.textMuted }}>Invalid or missing lot access. Please log in again.</p>
        <button onClick={() => navigate('/operator/login')} style={{ padding: '12px 24px', borderRadius: R.pill, background: 'var(--brand)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
          Back to Login
        </button>
      </div>
    )
  }

  const occupied = lot.totalSpots - lot.availableSpots
  const occupancyPct = Math.round((occupied / lot.totalSpots) * 100)
  const todayRevenue = Math.round(occupied * lot.pricePerHour * 4)
  const monthRevenue = Math.round(todayRevenue * 22)
  const status = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
  const statusColor = STATUS_COLOR[status]

  const statCards = [
    { label: 'Total Spots', value: lot.totalSpots, color: C.ink },
    { label: 'Occupied Now', value: occupied, color: '#d63031' },
    { label: 'Occupancy Rate', value: occupancyPct + '%', color: 'var(--brand)' },
    { label: 'Today Revenue', value: todayRevenue + ' LYD', color: '#00b894' },
    { label: 'Monthly Revenue', value: monthRevenue + ' LYD', color: '#6c5ce7' },
    { label: 'Available', value: lot.availableSpots, color: '#00b894' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.grey, fontFamily: FONT }}>

      {/* Top bar */}
      <div style={{
        background: C.ink, padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: R.sm, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shield" size={18} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', fontFamily: FONT }}>
              {getLotName(lot, lang)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontFamily: FONT }}>{email}</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/operator/login')}
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: 'none', padding: '7px 16px', borderRadius: R.pill, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, fontFamily: FONT }}
        >
          Logout
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 40px' }}>

        {/* Lot badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: C.white, borderRadius: R.card, padding: '14px 18px',
          boxShadow: SHADOW.soft, marginBottom: 20,
          borderLeft: `5px solid ${statusColor}`,
        }}>
          <Icon name="pin" size={20} color={statusColor} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.black, fontFamily: FONT }}>{getLotName(lot, lang)}</div>
            <div style={{ color: C.textMuted, fontSize: '0.8rem', fontFamily: FONT }}>{getLotAddress(lot, lang)}</div>
          </div>
          <span style={{ background: statusColor + '18', color: statusColor, fontWeight: 700, fontSize: '0.78rem', padding: '5px 12px', borderRadius: 99, fontFamily: FONT }}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        <MascotWelcome text={tr('operator_welcome')} />

        {/* Stat cards */}
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
          {statCards.map((s) => (
            <div key={s.label} style={{ background: C.white, borderRadius: R.card, padding: '16px 18px', boxShadow: SHADOW.soft, borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
              <div style={{ color: C.textMuted, fontSize: '0.82rem', fontFamily: FONT, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {TABS.map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              padding: '10px 20px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.86rem', fontFamily: FONT,
              background: tab === tb ? 'var(--brand)' : C.white,
              color: tab === tb ? '#fff' : C.textSoft,
              boxShadow: SHADOW.soft,
            }}>{tb}</button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div style={{ background: C.white, borderRadius: R.card, padding: '20px 20px 14px', boxShadow: SHADOW.soft }}>
              <h3 style={{ margin: '0 0 16px', color: C.black, fontSize: '0.95rem', fontFamily: FONT, fontWeight: 700 }}>Hourly Occupancy</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fontFamily: FONT }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => v + '%'} />
                  <Line type="monotone" dataKey="occupancy" stroke="var(--brand)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: C.white, borderRadius: R.card, padding: '20px 20px 14px', boxShadow: SHADOW.soft }}>
              <h3 style={{ margin: '0 0 16px', color: C.black, fontSize: '0.95rem', fontFamily: FONT, fontWeight: 700 }}>Weekly Bookings</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: FONT }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Revenue tab */}
        {tab === 'Revenue' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Today Revenue', value: todayRevenue + ' LYD', change: '+12% vs yesterday', color: '#00b894' },
              { label: 'This Month', value: monthRevenue + ' LYD', change: '+18% vs last month', color: 'var(--brand)' },
              { label: 'Price / Hour', value: lot.pricePerHour + ' LYD', change: 'Standard rate', color: '#6c5ce7' },
              { label: 'Peak Bonus', value: Math.round(lot.pricePerHour * 0.5 * occupied) + ' LYD', change: 'Peak hour multiplier', color: '#e17055' },
            ].map((s) => (
              <div key={s.label} style={{ background: C.white, borderRadius: R.card, padding: '20px 18px', boxShadow: SHADOW.soft, borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
                <div style={{ color: C.text, fontSize: '0.88rem', fontFamily: FONT, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                <div style={{ color: '#00b894', fontSize: '0.78rem', fontFamily: FONT, marginTop: 4 }}>{s.change}</div>
              </div>
            ))}
          </div>
        )}

        {/* Details tab */}
        {tab === 'Details' && (
          <div style={{ background: C.white, borderRadius: R.card, padding: 24, boxShadow: SHADOW.soft }}>
            <h3 style={{ margin: '0 0 18px', color: C.black, fontFamily: FONT, fontWeight: 700 }}>Lot Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'Name', value: getLotName(lot, lang) },
                { label: 'Address', value: getLotAddress(lot, lang) },
                { label: 'Total Capacity', value: lot.totalSpots + ' spots' },
                { label: 'Available Now', value: lot.availableSpots + ' spots' },
                { label: 'Price / Hour', value: lot.pricePerHour + ' LYD' },
                { label: 'Type', value: lot.type },
                { label: 'Open 24h', value: lot.open24h ? 'Yes' : 'No' },
                { label: 'Features', value: lot.features?.join(', ') || '—' },
              ].map((item) => (
                <div key={item.label} style={{ padding: '12px 16px', background: C.grey, borderRadius: R.sm }}>
                  <div style={{ fontSize: '0.72rem', color: C.textMuted, fontFamily: FONT, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.text, fontFamily: FONT }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
