import { useState, useEffect, useMemo } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { getAllReservations } from '../../firebase/adminService'
import { PARKING_LOTS } from '../../utils/constants'
import { calcSplit, RAKNA_SHARE, fmtHour } from '../../utils/pricing'
import Icon from '../../components/common/Icon'

const today = () => new Date().toISOString().slice(0, 10)

function fmtDate(ts) {
  if (!ts?.seconds) return '—'
  return new Date(ts.seconds * 1000).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function getDateStr(ts) {
  if (!ts?.seconds) return ''
  return new Date(ts.seconds * 1000).toISOString().slice(0, 10)
}

export default function AdminRevenue() {
  const { t } = useSettings()
  const [allRes, setAllRes] = useState([])
  const [loading, setLoading] = useState(true)
  const [lotFilter, setLotFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(today())

  useEffect(() => {
    getAllReservations()
      .then((rows) => setAllRes(rows))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filter reservations by lot + date
  const rows = useMemo(() => {
    return allRes.filter((r) => {
      if (lotFilter !== 'all' && r.lotId !== lotFilter) return false
      if (dateFilter && getDateStr(r.createdAt) !== dateFilter) return false
      return true
    }).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [allRes, lotFilter, dateFilter])

  // Revenue summary
  const summary = useMemo(() => {
    const gross  = rows.reduce((s, r) => s + (Number(r.total) || 0), 0)
    const rakna  = rows.reduce((s, r) => s + (Number(r.raknaRevenue) || Math.round(Number(r.total) * RAKNA_SHARE * 100) / 100 || 0), 0)
    const owner  = Math.round((gross - rakna) * 100) / 100
    return { gross: Math.round(gross * 100) / 100, rakna: Math.round(rakna * 100) / 100, owner, count: rows.length }
  }, [rows])

  const selStyle = {
    padding: '10px 14px', borderRadius: R.md, border: '1.5px solid ' + C.greyMid,
    background: C.white, color: C.text, fontSize: '0.88rem', fontFamily: 'inherit', cursor: 'pointer',
  }

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, margin: '8px 0 4px' }}>{t('a_revenue')}</h1>
      <p style={{ color: C.textMuted, fontSize: '0.85rem', margin: '0 0 20px' }}>{t('revenue_sub')}</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: '0.74rem', color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>{t('filter_lot')}</label>
          <select value={lotFilter} onChange={(e) => setLotFilter(e.target.value)} style={{ ...selStyle, width: '100%' }}>
            <option value="all">{t('all_lots')}</option>
            {PARKING_LOTS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: 'block', fontSize: '0.74rem', color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>{t('filter_date')}</label>
          <input
            type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
            style={{ ...selStyle, width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={() => setDateFilter(today())} style={{
            padding: '10px 18px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
            background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '0.85rem',
          }}>{t('today')}</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 22 }}>
        <StatCard label={t('rev_gross')}   value={summary.gross + ' LYD'}  color="#4F7BF5" icon="wallet" />
        <StatCard label={t('rev_rakna')}   value={summary.rakna + ' LYD'}  color="#26DE81" icon="star"   note={Math.round(RAKNA_SHARE * 100) + '%'} />
        <StatCard label={t('rev_owner')}   value={summary.owner + ' LYD'}  color="#A55EEA" icon="building" note={Math.round((1 - RAKNA_SHARE) * 100) + '%'} />
        <StatCard label={t('rev_bookings')} value={summary.count}           color="#F2C200" icon="ticket" />
      </div>

      {/* Revenue split explanation */}
      <div style={{ background: C.ink, borderRadius: R.md, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name="wallet" size={20} color={C.yellow} />
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
          {t('revenue_split_note')}
        </p>
      </div>

      {/* Bookings table */}
      {loading ? (
        <div style={{ textAlign: 'center', color: C.textMuted, padding: 40 }}>{t('loading')}</div>
      ) : rows.length === 0 ? (
        <div style={{ background: C.white, borderRadius: R.card, padding: '48px 20px', textAlign: 'center', boxShadow: SHADOW.soft }}>
          <Icon name="wallet" size={36} color={C.textMuted} />
          <p style={{ color: C.textMuted, marginTop: 10 }}>{t('rev_no_data')}</p>
        </div>
      ) : (
        <div style={{ background: C.white, borderRadius: R.card, boxShadow: SHADOW.soft, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 70px 90px 90px 90px 80px',
            gap: 8, padding: '12px 16px', background: C.grey,
            fontSize: '0.72rem', fontWeight: 700, color: C.textMuted, borderBottom: '1px solid ' + C.border,
          }}>
            <span>{t('booking_id')}</span>
            <span>{t('spot')}</span>
            <span>{t('duration')}</span>
            <span>{t('time_slot')}</span>
            <span>{t('total')}</span>
            <span style={{ color: '#26DE81' }}>ركنة ({Math.round(RAKNA_SHARE * 100)}%)</span>
            <span style={{ color: '#A55EEA' }}>{t('owner_share')}</span>
          </div>

          {rows.map((r, i) => {
            const split    = calcSplit(Number(r.total) || 0)
            const rakna    = r.raknaRevenue != null ? Number(r.raknaRevenue) : split.rakna
            const owner    = r.ownerRevenue != null ? Number(r.ownerRevenue) : split.owner
            const duration = r.duration || 1
            const timeSlot = r.fullDay ? t('full_day')
              : (r.fromHour != null ? `${fmtHour(r.fromHour)}–${fmtHour(r.toHour)}` : `${duration}h`)
            return (
              <div key={r.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 70px 90px 90px 90px 80px',
                gap: 8, padding: '12px 16px', fontSize: '0.84rem',
                borderBottom: i < rows.length - 1 ? '1px solid ' + C.grey : 'none',
                background: i % 2 === 0 ? C.white : 'rgba(230,237,248,0.4)',
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.black, fontSize: '0.82rem' }}>{r.id.slice(0, 8)}…</div>
                  <div style={{ color: C.textMuted, fontSize: '0.72rem' }}>{fmtDate(r.createdAt)}</div>
                  <div style={{ fontSize: '0.72rem', color: C.textSoft }}>{r.lotName}</div>
                </div>
                <span style={{ color: C.black, fontWeight: 600, alignSelf: 'center' }}>{r.spot || '—'}</span>
                <span style={{ color: C.textSoft, alignSelf: 'center' }}>{duration}h</span>
                <span style={{ color: C.textSoft, fontSize: '0.78rem', alignSelf: 'center' }}>{timeSlot}</span>
                <span style={{ fontWeight: 700, color: C.black, alignSelf: 'center' }}>{Number(r.total || 0).toFixed(2)} LYD</span>
                <span style={{ fontWeight: 700, color: '#26DE81', alignSelf: 'center' }}>{rakna.toFixed(2)} LYD</span>
                <span style={{ fontWeight: 700, color: '#A55EEA', alignSelf: 'center' }}>{owner.toFixed(2)} LYD</span>
              </div>
            )
          })}

          {/* Table footer totals */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 70px 90px 90px 90px 80px',
            gap: 8, padding: '14px 16px', background: C.ink, color: C.onInk, fontSize: '0.88rem', fontWeight: 800,
          }}>
            <span>{t('total')} ({rows.length})</span>
            <span />
            <span />
            <span />
            <span style={{ color: C.yellow }}>{summary.gross.toFixed(2)} LYD</span>
            <span style={{ color: '#26DE81' }}>{summary.rakna.toFixed(2)} LYD</span>
            <span style={{ color: '#A55EEA' }}>{summary.owner.toFixed(2)} LYD</span>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function StatCard({ label, value, color, icon, note }) {
  return (
    <div style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft, borderLeft: '5px solid ' + color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Icon name={icon} size={20} color={color} />
        {note && <span style={{ fontSize: '0.7rem', fontWeight: 700, color, background: color + '22', padding: '2px 7px', borderRadius: 99 }}>{note}</span>}
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: C.black, lineHeight: 1.1 }}>{value}</div>
      <div style={{ color: C.textMuted, fontSize: '0.82rem', marginTop: 4 }}>{label}</div>
    </div>
  )
}
