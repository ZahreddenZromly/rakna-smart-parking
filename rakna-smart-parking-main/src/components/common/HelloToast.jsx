import { useEffect, useState } from 'react'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Mascot from './Mascot'

const SEEN_KEY = 'rakna_hello_seen'

export default function HelloToast() {
  const { t, speak } = useSettings()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY) === '1') return
    const tmr = setTimeout(() => {
      localStorage.setItem(SEEN_KEY, '1')
      setShow(true)
      speak(t('hello_toast'))
    }, 800)
    return () => clearTimeout(tmr)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!show) return
    const tmr = setTimeout(() => setShow(false), 6500)
    return () => clearTimeout(tmr)
  }, [show])

  if (!show) return null

  return (
    <>
      <style>{`
        .hello-toast-wrap {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 80px;
          z-index: 2000;
          width: min(420px, 92vw);
        }
        @media (min-width: 768px) {
          .hello-toast-wrap {
            bottom: 24px;
          }
        }
      `}</style>

      <div className="hello-toast-wrap">
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: C.ink, color: C.onInk,
          borderRadius: R.card, padding: '12px 14px',
          boxShadow: SHADOW.card, animation: 'popIn 0.35s ease',
        }}>
          <button
            className="rukna-btn"
            onClick={() => speak(t('hello_toast'))}
            title={t('tap_me_hint')}
            aria-label={t('tap_me_hint')}
            style={{ flexShrink: 0, width: 48 }}
          >
            <Mascot size={48} mood="wave" />
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: C.yellow }}>
              {t('tip_label')}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4 }}>
              {t('hello_toast')}
            </div>
          </div>

          <button
            onClick={() => setShow(false)}
            aria-label="dismiss"
            style={{
              flexShrink: 0, background: 'rgba(255,255,255,0.15)',
              border: 'none', color: C.onInk,
              width: 24, height: 24, borderRadius: '50%',
              cursor: 'pointer', fontSize: '0.8rem', lineHeight: 1,
            }}
          >✕</button>
        </div>
      </div>
    </>
  )
}