import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import Mascot from '../common/Mascot'
import Icon from '../common/Icon'
import QueueOffer from './QueueOffer'
import { useLotQueue } from '../../hooks/useQueue'
import {
  joinQueue, leaveQueue, acceptOffer, declineOffer, reconcileQueue,
  positionOf, etaMinutes,
} from '../../firebase/queueService'
import { ensureNotifyPermission } from '../../utils/notify'

// Smart-queue panel shown on a full lot. Drives join → wait → offer → reserve.
export default function QueuePanel({ lot }) {
  const navigate = useNavigate()
  const { t, speak } = useSettings()
  const { user, profile } = useAuth()
  const { active, myEntry, waitingCount } = useLotQueue(lot.id, user?.uid)
  const [busy, setBusy] = useState(false)

  if (!user) {
    return (
      <Card>
        <Row mascot="sad">
          <strong style={{ color: C.black }}>{t('queue_title')}</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: C.textMuted }}>{t('queue_login_hint')}</p>
        </Row>
        <button onClick={() => navigate('/login')} style={primaryBtn}>{t('sign_in')}</button>
      </Card>
    )
  }

  const join = async () => {
    setBusy(true)
    try {
      await ensureNotifyPermission()
      await joinQueue({ lotId: lot.id, lotName: lot.name, userId: user.uid, userName: profile?.name || user.email || 'User' })
      speak(t('queue_joined'))
    } finally { setBusy(false) }
  }
  const leave = async () => { setBusy(true); try { await leaveQueue(myEntry.id) } finally { setBusy(false) } }
  const accept = async () => { await acceptOffer(myEntry); speak(t('queue_reserved')) }
  const decline = async () => { await declineOffer(myEntry) }
  const onExpire = () => reconcileQueue(lot.id).catch(() => {})

  // --- offered: show the timed reserve card ---
  if (myEntry?.status === 'offered') {
    return <QueueOffer entry={myEntry} onAccept={accept} onDecline={decline} onExpire={onExpire} />
  }

  // --- accepted: reserved ---
  if (myEntry?.status === 'accepted') {
    return (
      <Card highlight>
        <Row mascot="happy">
          <strong style={{ color: C.black }}>{t('queue_reserved_title')}</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: C.textMuted }}>{t('queue_reserved_sub')}</p>
        </Row>
        <button onClick={() => navigate('/my-reservations')} style={primaryBtn}>{t('view_my_bookings')}</button>
      </Card>
    )
  }

  // --- waiting: position + ETA ---
  if (myEntry?.status === 'waiting') {
    const pos = positionOf(active, myEntry) // 0-based
    const eta = etaMinutes(pos)
    return (
      <Card>
        <Row mascot={pos === 0 ? 'idle' : 'worried'}>
          <strong style={{ color: C.black }}>{t('queue_in_line')}</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: C.textMuted }}>{t('queue_hold_tight')}</p>
        </Row>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <Stat big={`#${pos + 1}`} label={t('queue_position')} />
          <Stat big={`${waitingCount}`} label={t('queue_total_waiting')} />
          <Stat big={eta === 0 ? t('queue_next') : `~${eta}`} label={eta === 0 ? t('queue_eta') : t('queue_eta_min')} />
        </div>
        <button onClick={leave} disabled={busy} style={ghostBtn}>{t('queue_leave')}</button>
      </Card>
    )
  }

  // --- not in queue: join ---
  return (
    <Card>
      <Row mascot="sad">
        <strong style={{ color: C.black }}>{t('queue_title')}</strong>
        <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: C.textMuted }}>
          {waitingCount > 0 ? `${waitingCount} ${t('queue_ahead')}` : t('queue_be_first')}
        </p>
      </Row>
      <button onClick={join} disabled={busy} style={primaryBtn}>
        <Icon name="clock" size={18} color={C.ink} /> {busy ? t('saving') : t('queue_join')}
      </button>
    </Card>
  )
}

// ---- little presentational helpers ----
function Card({ children, highlight }) {
  return (
    <div style={{
      marginTop: 16, background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.card,
      border: '1.5px solid ' + (highlight ? C.available : C.greyMid),
    }}>{children}</div>
  )
}
function Row({ children, mascot }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{ flexShrink: 0, width: 52 }}><Mascot size={52} mood={mascot} /></div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}
function Stat({ big, label }) {
  return (
    <div style={{ flex: 1, background: C.grey, borderRadius: R.md, padding: '10px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: C.black, lineHeight: 1.1 }}>{big}</div>
      <div style={{ fontSize: '0.64rem', color: C.textMuted, marginTop: 2 }}>{label}</div>
    </div>
  )
}
const primaryBtn = {
  width: '100%', padding: '14px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
  background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '0.95rem', boxShadow: SHADOW.yellow,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
}
const ghostBtn = {
  width: '100%', marginTop: 12, padding: '12px', borderRadius: R.pill, cursor: 'pointer',
  border: '1.5px solid ' + C.greyMid, background: C.white, color: C.textSoft, fontWeight: 600, fontSize: '0.88rem',
}
