import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { getUserReservations, cancelReservation } from '../firebase/reservationService'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'

const BADGE = {
  active: { bg: C.yellowSoft, fg: '#9A7B00', key: 'active' },
  completed: { bg: C.grey, fg: C.textMuted, key: 'completed' },
  cancelled: { bg: '#FFE5E3', fg: C.danger, key: 'cancelled' },
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

  const load = async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    try { setList(await getUserReservations(user.uid)) } catch { /* ignore */ }
    setLoading(false)
  }
  useEffect(() => { load() }, [user])

  const cancel = async (id) => {
    setList((l) => l.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r))
    try { await cancelReservation(id) } catch { /* ignore */ }
  }

  return (
    <MobileLayout bg={C.grey}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.black, margin: '24px 0 4px' }}>{t('my_bookings')}</h1>
      <p style={{ color: C.textMuted, fontSize: '0.88rem', margin: '0 0 18px' }}>{t('your_reservations')}</p>

      {!user ? (
        <LoginPrompt navigate={navigate} t={t} />
      ) : loading ? (
        <p style={{ color: C.textMuted, textAlign: 'center', marginTop: 30 }}>{t('loading')}</p>
      ) : list.length === 0 ? (
        <Empty navigate={navigate} t={t} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.map((r) => {
            const b = BADGE[r.status] || BADGE.active
            return (
              <div key={r.id} style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: R.md, background: C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="ticket" size={24} color={C.ink} /></div>
                    <div>
                      <div style={{ fontWeight: 700, color: C.black, fontSize: '0.95rem' }}>{r.lotName}</div>
                      <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: 2 }}>{t('spot')} {r.spot} · {fmtDate(r.createdAt)}</div>
                    </div>
                  </div>
                  <span style={{ background: b.bg, color: b.fg, fontWeight: 700, fontSize: '0.68rem', padding: '5px 10px', borderRadius: R.pill }}>{t(b.key)}</span>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <Mini label={t('payment_method')} value={r.paymentMethod || '—'} />
                  <Mini label={t('total')} value={r.total + ' LYD'} />
                </div>

                {r.status === 'active' && (
                  <button onClick={() => cancel(r.id)} style={{
                    marginTop: 14, width: '100%', padding: '11px', borderRadius: R.pill,
                    border: '1.5px solid ' + C.danger, background: C.white, color: C.danger,
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                  }}>{t('cancel_booking')}</button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <button onClick={() => navigate('/map')} style={{
        marginTop: 18, width: '100%', padding: '16px', borderRadius: R.pill, border: 'none',
        background: C.ink, color: C.onInk, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
      }}>{t('new_booking')}</button>
    </MobileLayout>
  )
}

function Mini({ label, value }) {
  return (
    <div style={{ flex: 1, background: C.grey, borderRadius: R.sm, padding: '10px 12px' }}>
      <div style={{ fontSize: '0.66rem', color: C.textMuted }}>{label}</div>
      <div style={{ fontWeight: 600, color: C.black, fontSize: '0.8rem', textTransform: 'capitalize' }}>{value}</div>
    </div>
  )
}

function Empty({ navigate, t }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: C.white, borderRadius: R.card }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}><Mascot size={110} mood="idle" /></div>
      <p style={{ color: C.textMuted, marginTop: 10 }}>{t('no_bookings')}</p>
      <button onClick={() => navigate('/map')} style={{ background: C.yellow, border: 'none', padding: '12px 24px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', color: C.ink }}>{t('find_parking')}</button>
    </div>
  )
}

function LoginPrompt({ navigate, t }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: C.white, borderRadius: R.card }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="lock" size={44} color={C.textMuted} /></div>
      <p style={{ color: C.textMuted }}>{t('please_login')}</p>
      <button onClick={() => navigate('/login')} style={{ background: C.yellow, border: 'none', padding: '12px 24px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', color: C.ink }}>{t('sign_in')}</button>
    </div>
  )
}
