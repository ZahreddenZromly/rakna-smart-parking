import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Icon from '../../components/common/Icon'
import { PARKING_LOTS, getLotName } from '../../utils/constants'
import {
  subscribeAllQueue, releaseSpot, declineOffer, removeEntry, reconcileQueue, isActive,
} from '../../firebase/queueService'

const STATUS_COLORS = {
  waiting: '#0984E3', offered: '#F2C200', accepted: '#26DE81',
  declined: '#636e72', expired: '#d63031', cancelled: '#b2bec3',
}
const lotById = (id) => PARKING_LOTS.find((l) => l.id === id)
const ts = (v) => (v?.seconds ? new Date(v.seconds * 1000).toLocaleTimeString() : '—')

export default function AdminQueue() {
  const { t, lang } = useSettings()
  const [entries, setEntries] = useState([])

  useEffect(() => subscribeAllQueue(setEntries), [])

  // act as the reconcile engine while the admin is watching
  useEffect(() => {
    const id = setInterval(() => {
      const lots = [...new Set(entries.filter(isActive).map((e) => e.lotId))]
      lots.forEach((l) => reconcileQueue(l).catch(() => {}))
    }, 8000)
    return () => clearInterval(id)
  }, [entries])

  const stats = useMemo(() => ({
    waiting: entries.filter((e) => e.status === 'waiting').length,
    offered: entries.filter((e) => e.status === 'offered').length,
    accepted: entries.filter((e) => e.status === 'accepted').length,
    expired: entries.filter((e) => e.status === 'expired' || e.status === 'declined').length,
  }), [entries])

  // group active entries by lot, FIFO order
  const byLot = useMemo(() => {
    const map = {}
    entries.filter(isActive).forEach((e) => { (map[e.lotId] ||= []).push(e) })
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.joinedAt?.seconds || 0) - (b.joinedAt?.seconds || 0)))
    return map
  }, [entries])

  const logs = useMemo(
    () => [...entries].sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0)).slice(0, 25),
    [entries],
  )

  const cards = [
    { label: t('queue_waiting'), value: stats.waiting, color: STATUS_COLORS.waiting },
    { label: t('queue_offered'), value: stats.offered, color: STATUS_COLORS.offered },
    { label: t('queue_accepted'), value: stats.accepted, color: STATUS_COLORS.accepted },
    { label: t('queue_expired'), value: stats.expired, color: STATUS_COLORS.expired },
  ]

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: '8px 0 18px' }}>{t('queue_dashboard')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft, borderLeft: '5px solid ' + c.color }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: C.black }}>{c.value}</div>
            <div style={{ color: C.textMuted, fontSize: '0.85rem' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.black, margin: '26px 0 12px' }}>{t('queue_live')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {PARKING_LOTS.map((lot) => {
          const list = byLot[lot.id] || []
          return (
            <div key={lot.id} style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ color: C.black, fontSize: '0.92rem' }}>{getLotName(lot, lang)}</strong>
                <button onClick={() => releaseSpot(lot.id)} style={{
                  background: C.yellow, color: C.ink, border: 'none', borderRadius: R.pill,
                  padding: '6px 12px', cursor: 'pointer', fontSize: '0.74rem', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                }}><Icon name="pin" size={13} color={C.ink} /> {t('queue_release')}</button>
              </div>
              {list.length === 0 ? (
                <p style={{ color: C.textMuted, fontSize: '0.82rem', padding: '8px 0', margin: 0 }}>{t('queue_empty')}</p>
              ) : list.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: i ? '1px solid ' + C.grey : 'none' }}>
                  <span style={{ fontWeight: 800, color: C.textSoft, width: 22 }}>#{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', color: C.black, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.userName || e.userId}</div>
                    <Chip status={e.status} label={t('q_' + e.status)} />
                  </div>
                  {e.status === 'offered' && (
                    <button onClick={() => declineOffer(e)} title={t('queue_skip')} style={miniBtn(C.reserved)}>{t('queue_skip')}</button>
                  )}
                  <button onClick={() => removeEntry(e.id)} title={t('queue_remove')} style={miniBtn(C.danger)}>✕</button>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.black, margin: '26px 0 12px' }}>{t('queue_logs')}</h2>
      <div style={{ background: C.white, borderRadius: R.card, padding: '4px 16px', boxShadow: SHADOW.soft, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr>{[t('queue_col_user'), t('queue_col_lot'), t('queue_col_status'), t('queue_col_joined'), t('queue_col_updated')].map((h) => (
              <th key={h} style={{ textAlign: 'start', color: C.textMuted, fontWeight: 600, padding: '10px 8px', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} style={{ color: C.textMuted, textAlign: 'center', padding: 16 }}>{t('queue_empty')}</td></tr>
            ) : logs.map((e) => (
              <tr key={e.id} style={{ borderTop: '1px solid ' + C.grey }}>
                <td style={{ padding: '9px 8px', color: C.black, fontWeight: 600 }}>{e.userName || '—'}</td>
                <td style={{ padding: '9px 8px', color: C.textSoft }}>{getLotName(lotById(e.lotId) || { name: e.lotId }, lang)}</td>
                <td style={{ padding: '9px 8px' }}><Chip status={e.status} label={t('q_' + e.status)} /></td>
                <td style={{ padding: '9px 8px', color: C.textMuted }}>{ts(e.joinedAt)}</td>
                <td style={{ padding: '9px 8px', color: C.textMuted }}>{ts(e.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

function Chip({ status, label }) {
  const color = STATUS_COLORS[status] || '#636e72'
  return <span style={{ display: 'inline-block', background: color + '22', color, fontWeight: 700, fontSize: '0.66rem', padding: '2px 8px', borderRadius: R.pill, marginTop: 3 }}>{label}</span>
}
const miniBtn = (color) => ({
  background: color + '18', color, border: 'none', borderRadius: 8, cursor: 'pointer',
  padding: '5px 9px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
})
