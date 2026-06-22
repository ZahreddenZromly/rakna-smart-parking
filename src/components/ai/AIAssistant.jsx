import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import Icon from '../common/Icon'
import Mascot from '../common/Mascot'
import { buildContext, answer, greeting, suggestions } from '../../utils/assistantEngine'
import { joinQueue } from '../../firebase/queueService'
import { getUserReservations } from '../../firebase/reservationService'
import { ensureNotifyPermission } from '../../utils/notify'

const FAB_SIZE = 62
const SNAP_MARGIN = 16

export default function AIAssistant() {
  const { t, lang, isRTL } = useSettings()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [bookings, setBookings] = useState([])
  const [messages, setMessages] = useState(() => {
    const g = greeting(buildContext(null, []), lang)
    return [{ role: 'assistant', content: g.text, actions: g.actions }]
  })
  const scrollRef = useRef(null)

  // FAB drag state
  const [fabPos, setFabPos] = useState({ bottom: 92, right: SNAP_MARGIN })
  const [dragging, setDragging] = useState(false)
  const hasMoved = useRef(false)
  const pointerStart = useRef(null)
  const posStart = useRef({ bottom: 92, right: SNAP_MARGIN })

  const onFabPointerDown = (e) => {
    hasMoved.current = false
    pointerStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { ...fabPos }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    e.preventDefault()
  }

  const onFabPointerMove = (e) => {
    if (!pointerStart.current) return
    const dx = e.clientX - pointerStart.current.x
    const dy = e.clientY - pointerStart.current.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved.current = true
    if (!hasMoved.current) return
    const newRight = posStart.current.right - dx
    const newBottom = posStart.current.bottom - dy
    setFabPos({
      right: Math.max(8, Math.min(newRight, window.innerWidth - FAB_SIZE - 8)),
      bottom: Math.max(8, Math.min(newBottom, window.innerHeight - FAB_SIZE - 8)),
    })
  }

  const onFabPointerUp = () => {
    setDragging(false)
    if (!hasMoved.current) {
      setOpen(true)
      return
    }
    // snap to nearest horizontal edge
    const centerX = window.innerWidth - fabPos.right - FAB_SIZE / 2
    const snapRight = centerX > window.innerWidth / 2 ? SNAP_MARGIN : window.innerWidth - FAB_SIZE - SNAP_MARGIN
    setFabPos((p) => ({ ...p, right: snapRight }))
  }

  // pull the user's bookings so the assistant can answer "my bookings"
  useEffect(() => {
    if (!user) return
    getUserReservations(user.uid).then(setBookings).catch(() => {})
  }, [user, open])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy, open])

  // let other parts of the app (e.g. the idle helper) open the assistant
  useEffect(() => {
    const openIt = () => setOpen(true)
    window.addEventListener('rakna:open-assistant', openIt)
    if (sessionStorage.getItem('rakna_open_assistant') === '1') {
      sessionStorage.removeItem('rakna_open_assistant')
      setOpen(true) // eslint-disable-line react-hooks/set-state-in-effect -- one-shot open when arriving from the idle helper
    }
    return () => window.removeEventListener('rakna:open-assistant', openIt)
  }, [])

  const send = async (forced) => {
    const text = (forced ?? input).trim()
    if (!text || busy) return
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setBusy(true)
    const ctx = buildContext(profile, bookings)
    const local = answer(text, ctx, lang)
    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })), context: ctx, lang }),
      })
      if (!r.ok) throw new Error('api')
      const data = await r.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.text || local.text, actions: local.actions }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: local.text, actions: local.actions }])
    }
    setBusy(false)
  }

  const exec = async (a) => {
    if (a.kind === 'ask') { send(a.q); return }
    setOpen(false)
    if (a.kind === 'route') navigate(a.to)
    else if (a.kind === 'lotSpots') navigate('/parking/' + a.lotId + '/spots')
    else if (a.kind === 'lotDetail') navigate('/parking/' + a.lotId)
    else if (a.kind === 'queue') {
      if (!user) { navigate('/login'); return }
      try {
        await ensureNotifyPermission()
        await joinQueue({ lotId: a.lotId, lotName: a.lotName, userId: user.uid, userName: profile?.name || user.email || 'User' })
      } catch { /* ignore */ }
      navigate('/parking/' + a.lotId)
    }
  }

  const chips = suggestions(lang)

  return (
    <>
      {!open && (
        <button
          onPointerDown={onFabPointerDown}
          onPointerMove={onFabPointerMove}
          onPointerUp={onFabPointerUp}
          aria-label={t('ai_assistant')}
          style={{
            position: 'fixed',
            bottom: fabPos.bottom,
            right: fabPos.right,
            zIndex: 1500,
            width: FAB_SIZE, height: FAB_SIZE, borderRadius: '50%',
            border: '2.5px solid rgba(255,255,255,0.15)',
            cursor: dragging ? 'grabbing' : 'grab',
            background: C.ink,
            boxShadow: dragging
              ? '0 12px 36px rgba(0,0,0,0.35)'
              : SHADOW.float,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'visible', padding: 0,
            touchAction: 'none',
            transition: dragging ? 'box-shadow 0.15s' : 'bottom 0.25s cubic-bezier(0.34,1.56,0.64,1), right 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s',
            transform: dragging ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <Mascot size={52} mood="idle" />
          {/* subtle pulse ring */}
          {!dragging && (
            <span style={{
              position: 'absolute', inset: -6, borderRadius: '50%',
              border: '2px solid rgba(79,123,245,0.35)',
              animation: 'glowPulse 2.4s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}
        </button>
      )}

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: FONT }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', animation: 'fadeIn 0.2s ease' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 480, height: '82vh',
            background: C.grey, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            display: 'flex', flexDirection: 'column', boxShadow: SHADOW.float, animation: 'sheetUp 0.3s ease',
          }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid ' + C.greyMid }}>
              <div style={{ width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mascot size={46} mood={busy ? 'thinking' : 'wave'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.black }}>{t('ai_assistant')}</div>
                <div style={{ fontSize: '0.75rem', color: C.textMuted }}>{t('ai_subtitle')}</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: C.white, cursor: 'pointer', color: C.textSoft, fontSize: '1rem' }}>✕</button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '11px 14px', borderRadius: 16, fontSize: '0.9rem', lineHeight: 1.5,
                    background: m.role === 'user' ? C.yellow : C.white,
                    color: m.role === 'user' ? C.ink : C.black,
                    borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: m.role === 'user' ? 16 : 4,
                    boxShadow: SHADOW.soft, whiteSpace: 'pre-wrap',
                  }}>{m.content}</div>
                  {m.actions?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {m.actions.map((a, n) => (
                        <button key={n} onClick={() => exec(a)} style={chipStyle}>
                          <Icon name={a.kind === 'queue' ? 'clock' : a.kind === 'route' ? 'chevron' : 'pin'} size={13} color={C.ink} />
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {busy && (
                <div style={{ alignSelf: 'flex-start', color: C.textMuted, fontSize: '0.85rem', padding: '6px 4px' }}>{t('ai_thinking')}</div>
              )}
            </div>

            {/* suggestion chips */}
            <div className="tab-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 14px 0' }}>
              {chips.map((s, n) => (
                <button key={n} onClick={() => send(s.q)} disabled={busy} style={{ ...chipStyle, background: C.white, whiteSpace: 'nowrap', flexShrink: 0 }}>{s.label}</button>
              ))}
            </div>

            {/* input */}
            <div style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid ' + C.greyMid, background: C.grey }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={t('ai_placeholder')}
                style={{ flex: 1, padding: '13px 16px', borderRadius: R.pill, border: '1.5px solid ' + C.greyMid, outline: 'none', fontSize: '0.95rem', background: C.white, color: C.text }}
              />
              <button onClick={() => send()} disabled={busy} aria-label="Send" style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: busy ? 'wait' : 'pointer',
                background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: SHADOW.yellow,
              }}>
                <Icon name="send" size={20} color={C.ink} style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const chipStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '7px 12px', borderRadius: R.pill, border: '1.5px solid ' + C.yellow,
  background: C.yellowSoft, color: C.ink, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
}
