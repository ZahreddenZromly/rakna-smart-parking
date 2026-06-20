import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { getAllReservations } from '../../firebase/adminService'

export default function AdminAnalytics() {
  const { t } = useSettings()
  const [byDay, setByDay] = useState([])
  const [totals, setTotals] = useState({ revenue: 0, bookings: 0, avg: 0 })

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllReservations()
        const map = {}
        res.forEach((r) => {
          const d = r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : new Date()
          const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          if (!map[key]) map[key] = { day: key, revenue: 0, bookings: 0 }
          map[key].revenue += Number(r.total) || 0
          map[key].bookings += 1
        })
        const rows = Object.values(map).slice(-14)
        setByDay(rows)
        const revenue = res.reduce((s, r) => s + (Number(r.total) || 0), 0)
        setTotals({ revenue, bookings: res.length, avg: res.length ? Math.round(revenue / res.length) : 0 })
      } catch { /* ignore */ }
    })()
  }, [])

  const cards = [
    { label: t('total_revenue'), value: totals.revenue + ' LYD', color: '#F2C200' },
    { label: t('total_bookings'), value: totals.bookings, color: '#A55EEA' },
    { label: 'Avg / booking', value: totals.avg + ' LYD', color: '#0984E3' },
  ]

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, margin: '8px 0 16px' }}>{t('a_analytics')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 18 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft, borderLeft: '5px solid ' + c.color }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: C.black }}>{c.value}</div>
            <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {byDay.length === 0 ? (
        <div style={{ background: C.white, borderRadius: R.card, padding: 40, textAlign: 'center', color: C.textMuted, boxShadow: SHADOW.soft }}>
          No booking data yet. Revenue charts appear once users start booking.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <Card title={t('revenue_by_day')}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray={'3 3'} stroke="#eee" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => v + ' LYD'} />
                <Line type="monotone" dataKey="revenue" stroke="#F2C200" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card title={t('bookings_by_day')}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray={'3 3'} stroke="#eee" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#A55EEA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '0.98rem', color: C.black }}>{title}</h3>
      {children}
    </div>
  )
}
