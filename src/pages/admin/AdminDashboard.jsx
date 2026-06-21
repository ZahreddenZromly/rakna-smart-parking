import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { getAllUsers, getAllReservations, isOnline } from '../../firebase/adminService'
import Icon from '../../components/common/Icon'
import MascotWelcome from '../../components/common/MascotWelcome'

export default function AdminDashboard() {
  const { t } = useSettings()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, online: 0, bookings: 0, revenue: 0 })

  useEffect(() => {
    (async () => {
      try {
        const [users, res] = await Promise.all([getAllUsers(), getAllReservations()])
        setStats({
          users: users.length,
          online: users.filter(isOnline).length,
          bookings: res.length,
          revenue: res.reduce((s, r) => s + (Number(r.total) || 0), 0),
        })
      } catch { /* ignore */ }
    })()
  }, [])

  const cards = [
    { label: t('total_users'), value: stats.users, icon: 'user', color: '#0984E3', to: '/admin/users' },
    { label: t('online_now'), value: stats.online, icon: 'user', color: '#26DE81', to: '/admin/users' },
    { label: t('total_bookings'), value: stats.bookings, icon: 'ticket', color: '#A55EEA', to: '/admin/analytics' },
    { label: t('total_revenue'), value: stats.revenue + ' LYD', icon: 'wallet', color: '#F2C200', to: '/admin/analytics' },
  ]

  const quick = [
    { label: t('a_users'), icon: 'user', to: '/admin/users' },
    { label: t('a_content'), icon: 'news', to: '/admin/content' },
    { label: t('a_parkings'), icon: 'pin', to: '/admin/parkings' },
    { label: t('a_queue'), icon: 'clock', to: '/admin/queue' },
    { label: t('a_partners'), icon: 'building', to: '/admin/partners' },
    { label: t('a_analytics'), icon: 'star', to: '/admin/analytics' },
  ]

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: '8px 0 18px' }}>{t('admin_dashboard')}</h1>

      <MascotWelcome text={t('admin_welcome')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {cards.map((c) => (
          <div key={c.label} onClick={() => navigate(c.to)} style={{
            background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft,
            borderLeft: '5px solid ' + c.color, cursor: 'pointer',
          }}>
            <Icon name={c.icon} size={24} color={c.color} />
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: C.black, marginTop: 6 }}>{c.value}</div>
            <div style={{ color: C.textMuted, fontSize: '0.85rem' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.black, margin: '26px 0 12px' }}>{t('admin_panel')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        {quick.map((q) => (
          <button key={q.label} onClick={() => navigate(q.to)} style={{
            background: C.white, borderRadius: R.card, padding: '22px 16px', boxShadow: SHADOW.soft,
            border: 'none', cursor: 'pointer', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name={q.icon} size={28} color={C.black} /></div>
            <div style={{ fontWeight: 700, color: C.black, marginTop: 8 }}>{q.label}</div>
          </button>
        ))}
      </div>
    </AdminLayout>
  )
}
