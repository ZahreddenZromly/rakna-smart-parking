import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { PARKING_LOTS, getAvailabilityStatus } from '../../utils/constants'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import MascotWelcome from '../../components/common/MascotWelcome'
import OperatorLayout from '../../components/operator/OperatorLayout'
import { C, R, SHADOW, FONT } from '../../styles/theme'

const hourlyData = [
  { hour: '6ص', occupancy: 20 }, { hour: '7ص', occupancy: 45 },
  { hour: '8ص', occupancy: 72 }, { hour: '9ص', occupancy: 88 },
  { hour: '10ص', occupancy: 85 }, { hour: '11ص', occupancy: 78 },
  { hour: '12م', occupancy: 90 }, { hour: '1م', occupancy: 95 },
  { hour: '2م', occupancy: 80 }, { hour: '3م', occupancy: 75 },
  { hour: '4م', occupancy: 88 }, { hour: '5م', occupancy: 92 },
  { hour: '6م', occupancy: 70 }, { hour: '7م', occupancy: 50 },
]

const weekData = [
  { day: 'الإث', bookings: 42, revenue: 210 },
  { day: 'الثل', bookings: 55, revenue: 275 },
  { day: 'الأر', bookings: 61, revenue: 305 },
  { day: 'الخم', bookings: 58, revenue: 290 },
  { day: 'الجم', bookings: 80, revenue: 480 },
  { day: 'السب', bookings: 75, revenue: 450 },
  { day: 'الأح', bookings: 38, revenue: 190 },
]

const monthlyRevenue = [
  { month: 'يناير', revenue: 3200 }, { month: 'فبراير', revenue: 3800 },
  { month: 'مارس', revenue: 4100 }, { month: 'أبريل', revenue: 4600 },
  { month: 'مايو', revenue: 5200 }, { month: 'يونيو', revenue: 5800 },
]

const TABS = [
  { key: 'overview', label: 'نظرة عامة' },
  { key: 'revenue',  label: 'الإيرادات' },
  { key: 'lots',     label: 'المواقف' },
]

const STATUS_COLOR = { available: C.available, limited: C.reserved, full: C.danger }
const STATUS_LABEL = { available: 'متاح', limited: 'يمتلئ', full: 'ممتلئ' }

export default function OperatorDashboardPage() {
  const [tab, setTab] = useState('overview')
  const navigate      = useNavigate()
  const { t }         = useSettings()
  const { profile }   = useAuth()

  // الموقف المعين للمشغل
  const lotId  = profile?.lotId
  const myLots = lotId ? PARKING_LOTS.filter(l => l.id === lotId) : PARKING_LOTS

  const totalSpots    = myLots.reduce((a, b) => a + b.totalSpots, 0)
  const totalAvail    = myLots.reduce((a, b) => a + b.availableSpots, 0)
  const totalOccupied = totalSpots - totalAvail
  const occupancyPct  = totalSpots ? Math.round((totalOccupied / totalSpots) * 100) : 0

  const lotRevenue = myLots.map((lot) => ({
    name: lot.name,
    revenue: Math.round((lot.totalSpots - lot.availableSpots) * lot.pricePerHour * 6),
  }))

  const statCards = [
    { label: 'إجمالي المواقف',  value: totalSpots,           color: 'var(--brand)' },
    { label: 'مشغولة الآن',      value: totalOccupied,        color: C.danger },
    { label: 'نسبة الإشغال',     value: occupancyPct + '%',   color: '#0984E3' },
    { label: 'إيراد اليوم',      value: '450 د.ل',            color: C.available },
    { label: 'إيراد الشهر',      value: '5,800 د.ل',          color: '#A55EEA' },
    { label: 'حجوزات نشطة',      value: 47,                   color: '#E17055' },
  ]

  return (
    <OperatorLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <MascotWelcome text={t('operator_welcome')} />

        {/* كروت الإحصائيات */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14, marginBottom: 24 }}>
          {statCards.map((s) => (
            <div key={s.label} style={{
              background: C.white, borderRadius: R.card, padding: 18,
              boxShadow: SHADOW.soft, borderLeft: '5px solid ' + s.color,
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
              <div style={{ color: C.textMuted, fontSize: '0.82rem', marginTop: 2, fontFamily: FONT }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* نظرة عامة */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 16 }}>
              <ChartCard title="الإشغال بالساعة (%)">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => v + '%'} />
                    <Line type="monotone" dataKey="occupancy" stroke="var(--brand)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="الحجوزات الأسبوعية">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="var(--brand)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* جدول المواقف */}
            <div style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft, overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 16px', color: C.black, fontSize: '1rem', fontFamily: FONT }}>حالة المواقف المباشرة</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: C.grey }}>
                    {['اسم الموقف','متاح','الإجمالي','الإشغال','الحالة'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'start', color: C.textMuted, fontWeight: 600, fontSize: '0.78rem', fontFamily: FONT }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myLots.map((lot) => {
                    const status = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
                    const color  = STATUS_COLOR[status]
                    const pct    = Math.round(((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100)
                    return (
                      <tr key={lot.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: C.black, fontFamily: FONT }}>{lot.name}</td>
                        <td style={{ padding: '12px', color: C.available, fontWeight: 600, fontFamily: FONT }}>{lot.availableSpots}</td>
                        <td style={{ padding: '12px', color: C.textMuted, fontFamily: FONT }}>{lot.totalSpots}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, background: C.grey, borderRadius: 4, height: 8 }}>
                              <div style={{ width: pct + '%', background: color, borderRadius: 4, height: '100%' }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', color: C.textMuted, minWidth: 32, fontFamily: FONT }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: color + '22', color, padding: '3px 10px', borderRadius: R.pill, fontSize: '0.76rem', fontWeight: 600, fontFamily: FONT }}>
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

        {/* الإيرادات */}
        {tab === 'revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ChartCard title="الإيرادات الشهرية (د.ل)">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => v + ' د.ل'} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--brand)" strokeWidth={3} dot={{ fill: 'var(--brand)', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="الإيراد حسب الموقف">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={lotRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip formatter={(v) => v + ' د.ل'} />
                  <Bar dataKey="revenue" fill="#A55EEA" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 14 }}>
              {[
                { label: 'إيراد اليوم',    value: '450 د.ل',   change: '+12% أمس' },
                { label: 'هذا الشهر',      value: '5,800 د.ل', change: '+18% الشهر الماضي' },
                { label: 'أوقات الذروة',   value: '340 د.ل',   change: '+5% هذا الأسبوع' },
              ].map((s) => (
                <div key={s.label} style={{ background: C.white, borderRadius: R.card, padding: 18, textAlign: 'center', boxShadow: SHADOW.soft }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, fontFamily: FONT }}>{s.value}</div>
                  <div style={{ color: C.textMuted, fontSize: '0.82rem', marginTop: 2, fontFamily: FONT }}>{s.label}</div>
                  <div style={{ color: C.available, fontWeight: 700, fontSize: '0.78rem', marginTop: 4, fontFamily: FONT }}>{s.change}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* المواقف */}
        {tab === 'lots' && (
          <div style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft, overflowX: 'auto' }}>
            <h3 style={{ margin: '0 0 16px', color: C.black, fontSize: '1rem', fontFamily: FONT }}>قائمة المواقف</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: C.grey }}>
                  {['اسم الموقف','العنوان','متاح','الإجمالي','السعر/ساعة','الحالة'].map((h) => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'start', color: C.textMuted, fontWeight: 600, fontSize: '0.78rem', fontFamily: FONT }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myLots.map((lot) => {
                  const status = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
                  const color  = STATUS_COLOR[status]
                  return (
                    <tr key={lot.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: C.black, fontFamily: FONT }}>{lot.name}</td>
                      <td style={{ padding: '12px', color: C.textMuted, fontFamily: FONT }}>{lot.address}</td>
                      <td style={{ padding: '12px', color: C.available, fontWeight: 600, fontFamily: FONT }}>{lot.availableSpots}</td>
                      <td style={{ padding: '12px', color: C.textMuted, fontFamily: FONT }}>{lot.totalSpots}</td>
                      <td style={{ padding: '12px', color: C.textMuted, fontFamily: FONT }}>{lot.pricePerHour} د.ل</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: color + '22', color, padding: '3px 10px', borderRadius: R.pill, fontSize: '0.76rem', fontWeight: 600, fontFamily: FONT }}>
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
    </OperatorLayout>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '0.98rem', color: C.black, fontFamily: FONT }}>{title}</h3>
      {children}
    </div>
  )
}