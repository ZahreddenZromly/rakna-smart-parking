import { useEffect, useRef, useState } from 'react'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Mascot from '../common/Mascot'

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// The timed "a space is available — reserve it?" card with a live countdown.
// onExpire fires once when the deadline passes (the caller then reconciles).
export default function QueueOffer({ entry, onAccept, onDecline, onExpire }) {
  const { t } = useSettings()
  const [busy, setBusy] = useState(false)
  const deadline = entry?.offerExpiresAt || 0
  const [left, setLeft] = useState(() => Math.max(0, Math.round((deadline - Date.now()) / 1000)))
  const firedExpire = useRef(false)

  useEffect(() => {
    firedExpire.current = false
    const tick = () => {
      const s = Math.max(0, Math.round((deadline - Date.now()) / 1000))
      setLeft(s)
      if (s <= 0 && !firedExpire.current) {
        firedExpire.current = true
        onExpire?.()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [deadline, onExpire])

  const pct = deadline ? Math.max(0, Math.min(100, (left / ((entry.offerExpiresAt - entry.offeredAt) / 1000 || 180)) * 100)) : 0

  const accept = async () => { setBusy(true); try { await onAccept?.() } finally { setBusy(false) } }
  const decline = async () => { setBusy(true); try { await onDecline?.() } finally { setBusy(false) } }

  return (
    <div style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.card, border: '2px solid ' + C.yellow, animation: 'popIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flexShrink: 0, width: 52 }}><Mascot size={52} mood="happy" /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.yellowDark }}>{t('tip_label')}</div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: C.black, lineHeight: 1.4 }}>{t('queue_offer_q')}</div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: left <= 30 ? C.danger : C.black, fontVariantNumeric: 'tabular-nums' }}>{fmt(left)}</div>
          <div style={{ fontSize: '0.6rem', color: C.textMuted }}>{t('queue_time_left')}</div>
        </div>
      </div>

      {/* countdown bar */}
      <div style={{ background: C.grey, borderRadius: R.pill, height: 6, marginTop: 12, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: left <= 30 ? C.danger : C.yellow, borderRadius: R.pill, transition: 'width 1s linear' }} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={accept} disabled={busy} style={{
          flex: 1, padding: '13px', borderRadius: R.pill, border: 'none', cursor: busy ? 'wait' : 'pointer',
          background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '0.95rem', boxShadow: SHADOW.yellow,
        }}>{t('queue_accept')}</button>
        <button onClick={decline} disabled={busy} style={{
          padding: '13px 18px', borderRadius: R.pill, cursor: busy ? 'wait' : 'pointer',
          border: '1.5px solid ' + C.greyMid, background: C.white, color: C.textSoft, fontWeight: 600, fontSize: '0.9rem',
        }}>{t('queue_decline')}</button>
      </div>
    </div>
  )
}
