import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { getUserReservations, cancelReservation } from '../firebase/reservationService'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'

const BADGE = {
  active:    { bg: 'rgba(79,123,245,0.1)', fg: 'var(--brand)',  key: 'active'    },
  completed: { bg: C.grey,                 fg: C.textMuted,     key: 'completed' },
  cancelled: { bg: '#FFE5E3',              fg: C.danger,        key: 'cancelled' },
}

const fmtDate = (ts) => {
  if (!ts?.seconds) return ''
  return new Date(ts.seconds * 1000).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function MyReservationsPage() {
  const navigate = useNavigate()
  const { t } = useSettings()
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    getUserReservations(user.uid)
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const cancel = async (id) => {
    setList((l) => l.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r))
    try { await cancelReservation(id) } catch { /* ignore */ }
  }

  return (
    <MobileLayout bg={C.grey}>

      {/* Header */}
      <div className="anim-card" style={{ margin: '24px 0 20px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: 0, fontFamily: FONT }}>{t('my_bookings')}</h1>
        <p style={{ color: C.textMuted, fontSize: '0.88rem', margin: '4px 0 0', fontFamily: FONT }}>{t('your_reservations')}</p>
      </div>

      {!user ? (
        <LoginPrompt navigate={navigate} t={t} />
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--brand)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : list.length === 0 ? (
        <Empty navigate={navigate} t={t} />
      ) : (
        <>
          {/* Responsive grid: 1 col → 2 col at 640px */}
          <div className="resp-2 stagger">
            {list.map((r) => {
              const b = BADGE[r.status] || BADGE.active
              return (
                <div key={r.id} className="press" style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 46, height: 46, borderRadius: R.md, background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="ticket" size={22} color="var(--brand)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: C.black, fontSize: '0.95rem', fontFamily: FONT }}>{r.lotName}</div>
                        <div style={{ color: C.textMuted, fontSize: '0.76rem', marginTop: 2, fontFamily: FONT }}>{t('spot')} {r.spot}</div>
                        <div style={{ color: C.textMuted, fontSize: '0.74rem', fontFamily: FONT }}>{fmtDate(r.createdAt)}</div>
                      </div>
                    </div>
                    <span style={{ background: b.bg, color: b.fg, fontWeight: 700, fontSize: '0.65rem', padding: '4px 10px', borderRadius: R.pill, fontFamily: FONT, flexShrink: 0 }}>
                      {t(b.key)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <Mini label={t('payment_method')} value={r.paymentMethod || '—'} />
                    <Mini label={t('total')} value={r.total + ' LYD'} highlight />
                  </div>

                  {r.status === 'active' && (
                    <button onClick={() => cancel(r.id)} style={{
                      marginTop: 14, width: '100%', padding: '11px', borderRadius: R.pill,
                      border: 'none', background: 'rgba(255,59,48,0.08)', color: C.danger,
                      fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: FONT,
                    }}>{t('cancel_booking')}</button>
                  )}
                </div>
              )
            })}
          </div>

          <button onClick={() => navigate('/map')} className="press" style={{
            marginTop: 20, width: '100%', padding: '16px', borderRadius: R.pill, border: 'none',
            background: C.ink, color: C.onInk, fontWeight: 700, fontSize: '0.95rem',
            cursor: 'pointer', fontFamily: FONT,
          }}>{t('new_booking')}</button>
        </>
      )}

    </MobileLayout>
  )
}

function Mini({ label, value, highlight }) {
  return (
    <div style={{ flex: 1, background: C.grey, borderRadius: R.sm, padding: '10px 12px' }}>
      <div style={{ fontSize: '0.66rem', color: C.textMuted, fontFamily: FONT }}>{label}</div>
      <div style={{ fontWeight: 700, color: highlight ? 'var(--brand)' : C.black, fontSize: '0.82rem', textTransform: 'capitalize', fontFamily: FONT }}>{value}</div>
    </div>
  )
}

function Empty({ navigate, t }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: C.white, borderRadius: R.card, boxShadow: SHADOW.soft }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Mascot size={110} mood="thinking" /></div>
      <p style={{ color: C.textMuted, fontFamily: FONT }}>{t('no_bookings')}</p>
      <button onClick={() => navigate('/map')} className="press" style={{ background: 'var(--brand)', border: 'none', padding: '12px 28px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: FONT }}>{t('find_parking')}</button>
    </div>
  )
}

function LoginPrompt({ navigate, t }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: C.white, borderRadius: R.card, boxShadow: SHADOW.soft }}>
      <Icon name="lock" size={44} color={C.textMuted} />
      <p style={{ color: C.textMuted, fontFamily: FONT }}>{t('please_login')}</p>
      <button onClick={() => navigate('/login')} className="press" style={{ background: 'var(--brand)', border: 'none', padding: '12px 28px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: FONT }}>{t('sign_in')}</button>
    </div>
  )
}
