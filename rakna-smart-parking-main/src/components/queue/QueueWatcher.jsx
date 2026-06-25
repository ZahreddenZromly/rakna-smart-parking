import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import QueueOffer from './QueueOffer'
import { useMyEntries } from '../../hooks/useQueue'
import { acceptOffer, declineOffer, reconcileQueue } from '../../firebase/queueService'
import { notify } from '../../utils/notify'

export default function QueueWatcher() {
  const { t, speak } = useSettings()
  const { user } = useAuth()
  const location = useLocation()
  const entries = useMyEntries(user?.uid)
  const announced = useRef(null)

  const offered = entries.find((e) => e.status === 'offered')

  useEffect(() => {
    if (offered && announced.current !== offered.id) {
      announced.current = offered.id
      notify(t('queue_notify_title'), t('queue_offer_q'))
      speak(t('queue_offer_q'))
    }
    if (!offered) announced.current = null
  }, [offered, t, speak])

  if (!offered) return null
  if (location.pathname === '/parking/' + offered.lotId) return null

  return (
    <>
      <style>{`
        .queue-watcher-wrap {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 80px;
          z-index: 2100;
          width: min(430px, 94vw);
        }
        @media (min-width: 768px) {
          .queue-watcher-wrap {
            bottom: 24px;
          }
        }
      `}</style>

      <div className="queue-watcher-wrap">
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: -10, insetInlineStart: 16,
            background: C.ink, color: C.onInk,
            fontSize: '0.66rem', fontWeight: 700,
            padding: '3px 10px', borderRadius: R.pill,
            boxShadow: SHADOW.soft,
          }}>
            {offered.lotName}
          </div>
          <QueueOffer
            entry={offered}
            onAccept={async () => { await acceptOffer(offered); speak(t('queue_reserved')) }}
            onDecline={async () => { await declineOffer(offered) }}
            onExpire={() => reconcileQueue(offered.lotId).catch(() => {})}
          />
        </div>
      </div>
    </>
  )
}