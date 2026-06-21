import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { PARKING_LOTS, getAvailabilityStatus, STATUS_COLOR, STATUS_LABEL } from '../../utils/constants'
import { useSettings } from '../../context/SettingsContext'
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
  { day: 'Mon', bookings: 42, revenue: 210 },
  { day: 'Tue', bookings: 55, revenue: 275 },
  { day: 'Wed', bookings: 61, revenue: 305 },
  { day: 'Thu', bookings: 58, revenue: 290 },
  { day: 'Fri', bookings: 80, revenue: 480 },
  { day: 'Sat', bookings: 75, revenue: 450 },
  { day: 'Sun', bookings: 38, revenue: 190 },
]

const monthlyRevenue = [
  { month: 'Jan', revenue: 3200 }, { month: 'Feb', revenue: 3800 },
  { month: 'Mar', revenue: 4100 }, { month: 'Apr', revenue: 4600 },
  { month: 'May', revenue: 5200 }, { month: 'Jun', revenue: 5800 },
]

const lotRevenue = PARKING_LOTS.map((lot) => ({
  name: lot.name.split(' ').slice(0, 2).join(' '),
  revenue: Math.round((lot.totalSpots - lot.availableSpots) * lot.pricePerHour * 6),
}))

const totalSpots = PARKING_LOTS.reduce((a, b) => a + b.totalSpots, 0)
const totalAvailable = PARKING_LOTS.reduce((a, b) => a + b.availableSpots, 0)
const totalOccupied = totalSpots - totalAvailable
const occupancyPct = Math.round((totalOccupied / totalSpots) * 100)
const todayRevenue = 450
const monthRevenue = 5800

const TABS = ['Overview', 'Revenue', 'Lots']

export default function OperatorDashboardPage() {
  const [tab, setTab] = useState('Overview')
  const navigate = useNavigate()
  const { t: tr } = useSettings()

  const statCards = [
    { label: 'Total Spots', value: totalSpots, color: '#1a1a2e', icon: 'P' },
    { label: 'Occupied Now', value: totalOccupied, color: '#d63031', icon: 'C' },
    { label: 'Occupancy Rate', value: occupancyPct + '%', color: '#0984e3', icon: '%' },
    { label: 'Today Revenue', value: todayRevenue + ' LYD', color: '#00b894', icon: '$' },
    { label: 'Monthly Revenue', value: monthRevenue + ' LYD', color: '#6c5ce7', icon: 'M' },
    { label: 'Active Bookings', value: 47, color: '#e17055', icon: 'B' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: '#1a1a2e', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#00b894', fontWeight: 700, fontSize: '1.2rem' }}>Operator Dashboard</span>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#b2bec3', border: '1px solid #444', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>

        <MascotWelcome text={tr('operator_welcome')} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map((s) => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '1.3rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: '5px solid ' + s.color }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: '#636e72', fontSize: '0.85rem', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '1.5rem', background: '#fff', padding: '4px', borderRadius: '10px', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 22px', border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem',
              background: tab === t ? '#1a1a2e' : 'transparent',
              color: tab === t ? '#fff' : '#636e72',
            }}>{t}</button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#1a1a2e', fontSize: '1rem' }}>Hourly Occupancy (%)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray={'3 3'} stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => v + '%'} />
                    <Line type="monotone" dataKey="occupancy" stroke="#00b894" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ margin: '0 0 1.5rem', color: '#1a1a2e', fontSize: '1rem' }}>Weekly Bookings</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weekData}>
                    <CartesianGrid strokeDasharray={'3 3'} stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1.5rem', color: '#1a1a2e', fontSize: '1rem' }}>Live Status - All Lots</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    {['Lot Name', 'Available', 'Total', 'Occupancy', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#636e72', fontWeight: 600, fontSize: '0.82rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PARKING_LOTS.map((lot) => {
                    const status = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
                    const color = STATUS_COLOR[status]
                    const pct = Math.round(((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100)
                    return (
                      <tr key={lot.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#1a1a2e' }}>{lot.name}</td>
                        <td style={{ padding: '12px', color: '#00b894', fontWeight: 600 }}>{lot.availableSpots}</td>
                        <td style={{ padding: '12px', color: '#636e72' }}>{lot.totalSpots}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '4px', height: '8px' }}>
                              <div style={{ width: pct + '%', background: color, borderRadius: '4px', height: '100%' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#636e72', minWidth: '32px' }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: color + '20', color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                            {STATUS_LABEL[status]}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'Revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#1a1a2e', fontSize: '1rem' }}>Monthly Revenue (LYD)</h3>
                <button style={{ background: '#f0f0f0', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#636e72' }}>
                  Export CSV
                </button>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray={'3 3'} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => v + ' LYD'} />
                  <Line type="monotone" dataKey="revenue" stroke="#00b894" strokeWidth={3} dot={{ fill: '#00b894', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 1.5rem', color: '#1a1a2e', fontSize: '1rem' }}>Revenue by Lot</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={lotRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray={'3 3'} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip formatter={(v) => v + ' LYD'} />
                  <Bar dataKey="revenue" fill="#6c5ce7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'Today Revenue', value: todayRevenue + ' LYD', change: '+12% vs yesterday' },
                { label: 'This Month', value: monthRevenue + ' LYD', change: '+18% vs last month' },
                { label: 'Peak Hour Bonus', value: '340 LYD', change: '+5% this week' },
              ].map((s) => (
                <div key={s.label} style={{ background: '#f8f9fa', borderRadius: '10px', padding: '1.2rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a2e' }}>{s.value}</div>
                  <div style={{ color: '#636e72', fontSize: '0.82rem', marginTop: '2px' }}>{s.label}</div>
                  <div style={{ color: '#00b894', fontWeight: 700, fontSize: '0.82rem', marginTop: '4px' }}>{s.change}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Lots' && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: '#1a1a2e', fontSize: '1rem' }}>All Parking Lots</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Lot Name', 'Address', 'Available', 'Total', 'Price/hr', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#636e72', fontWeight: 600, fontSize: '0.82rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PARKING_LOTS.map((lot) => {
                  const status = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
                  const color = STATUS_COLOR[status]
                  return (
                    <tr key={lot.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#1a1a2e' }}>{lot.name}</td>
                      <td style={{ padding: '12px', color: '#636e72' }}>{lot.address}</td>
                      <td style={{ padding: '12px', color: '#00b894', fontWeight: 600 }}>{lot.availableSpots}</td>
                      <td style={{ padding: '12px', color: '#636e72' }}>{lot.totalSpots}</td>
                      <td style={{ padding: '12px', color: '#636e72' }}>{lot.pricePerHour} LYD</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: color + '20', color, padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
