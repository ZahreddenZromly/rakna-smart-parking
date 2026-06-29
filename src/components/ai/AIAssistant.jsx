import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import Icon from '../common/Icon'
import CyclingMascot from '../common/CyclingMascot'
import { buildContext, answer, greeting, suggestions } from '../../utils/assistantEngine'
import { joinQueue } from '../../firebase/queueService'
import { getUserReservations } from '../../firebase/reservationService'
import { ensureNotifyPermission } from '../../utils/notify'

const FAB_SIZE = 62
const SNAP_MARGIN = 16

export default function AIAssistant() {
  const { t, lang, isRTL, say, stopSpeaking } = useSettings()
  const { user, profile, isAdmin } = useAuth()
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

  // The chat reads its replies aloud. On by default; user can mute (remembered).
  const [voiceOn, setVoiceOn] = useState(() => localStorage.getItem('rakna_ai_voice') !== '0')
  useEffect(() => { localStorage.setItem('rakna_ai_voice', voiceOn ? '1' : '0') }, [voiceOn])

  // voice input — MediaRecorder + Groq Whisper (works on iOS + all browsers)
  const [recording, setRecording] = useState(false)
  const [err, setErr] = useState('')
  const mediaRef = useRef({ recorder: null, chunks: [] })
  const autoStopRef = useRef(null)

  const micSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  function getSupportedMime() {
    if (typeof MediaRecorder === 'undefined') return ''
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
    return types.find(t => MediaRecorder.isTypeSupported(t)) || ''
  }

  async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const stopRecording = () => {
    clearTimeout(autoStopRef.current)
    if (mediaRef.current.recorder?.state === 'recording') {
      mediaRef.current.recorder.stop()
    }
  }

  const toggleMic = async () => {
    if (recording) { stopRecording(); return }
    setErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const mime = getSupportedMime()
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {})
      mediaRef.current = { recorder, chunks: [] }

      recorder.ondataavailable = (e) => {
        if (e.data?.size > 0) mediaRef.current.chunks.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setRecording(false)
        const { chunks } = mediaRef.current
        if (!chunks.length) return
        const actualMime = recorder.mimeType || mime || 'audio/webm'
        const blob = new Blob(chunks, { type: actualMime })
        setBusy(true)
        try {
          const base64 = await blobToBase64(blob)
          const r = await fetch('/api/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64, lang, mime: actualMime.split(';')[0] }),
          })
          if (r.ok) {
            const data = await r.json()
            if (data.text?.trim()) { send(data.text.trim()); return }
          }
          if (r.status === 503) {
            // No Groq key — fall back to Web Speech API on desktop
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SR) {
              const rec = new SR()
              rec.lang = lang === 'ar' ? 'ar' : 'en-US'
              rec.interimResults = false
              rec.onresult = (e) => { const tx = (e.results[0][0].transcript || '').trim(); if (tx) send(tx) }
              rec.onerror = () => setErr(lang === 'ar' ? 'لم يتعرف على الصوت' : 'Could not recognise speech')
              try { rec.start() } catch { /* ignore */ }
              setBusy(false)
              return
            }
          }
          setErr(lang === 'ar' ? 'لم أفهم، جرب مرة ثانية' : 'Could not understand, try again')
        } catch {
          setErr(lang === 'ar' ? 'خطأ في التعرف، جرب مرة ثانية' : 'Recognition error, try again')
        }
        setBusy(false)
      }

      recorder.start()
      setRecording(true)
      // Auto-stop after 30 seconds
      autoStopRef.current = setTimeout(stopRecording, 30000)
    } catch (e) {
      setRecording(false)
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setErr(lang === 'ar' ? 'الميكروفون محجوب — اسمح للمتصفح باستخدامه من الإعدادات' : 'Mic blocked — allow microphone in browser settings')
      }
    }
  }

  // stop recording if chat closes
  useEffect(() => {
    if (!open && recording) stopRecording()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // once profile loads, personalize the greeting with the user's name
  useEffect(() => {
    if (!profile) return
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].role !== 'assistant') return prev
      const g = greeting(buildContext(profile, []), lang)
      return [{ role: 'assistant', content: g.text, actions: g.actions }]
    })
  }, [profile, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy, open])

  // greet aloud when the chat opens; stop talking when it closes
  useEffect(() => {
    if (open) {
      if (voiceOn) {
        const last = messages[messages.length - 1]
        if (last?.role === 'assistant') say(last.content)
      }
    } else {
      stopSpeaking()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

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
    const ctx = buildContext(profile, bookings, isAdmin)
    const local = answer(text, ctx, lang)
    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })), context: ctx, lang }),
      })
      if (!r.ok) throw new Error('api')
      const data = await r.json()
      const reply = data.text || local.text
      setMessages((m) => [...m, { role: 'assistant', content: reply, actions: local.actions }])
      if (voiceOn) say(reply)
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: local.text, actions: local.actions }])
      if (voiceOn) say(local.text)
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
          <CyclingMascot size={52} intervalMs={3200} />
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
                <CyclingMascot size={46} intervalMs={2400} forced={busy ? 'thinking' : null} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.black }}>{t('ai_assistant')}</div>
                <div style={{ fontSize: '0.75rem', color: C.textMuted }}>{t('ai_subtitle')}</div>
              </div>
              <button
                onClick={() => setVoiceOn((v) => { if (v) stopSpeaking(); return !v })}
                title={voiceOn ? t('ai_mute') : t('ai_unmute')}
                aria-label={voiceOn ? t('ai_mute') : t('ai_unmute')}
                style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: voiceOn ? C.yellowSoft : C.white, cursor: 'pointer', fontSize: '1rem' }}
              >{voiceOn ? '🔊' : '🔇'}</button>
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

            {/* error banner */}
            {err && (
              <div style={{ margin: '0 14px 6px', padding: '8px 12px', borderRadius: R.md, background: '#FFE5E3', color: C.danger, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{err}</span>
                <button onClick={() => setErr('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.danger, fontWeight: 700, padding: '0 4px' }}>✕</button>
              </div>
            )}

            {/* input */}
            <div style={{ display: 'flex', gap: 8, padding: 14, borderTop: '1px solid ' + C.greyMid, background: C.grey }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                disabled={recording}
                placeholder={recording ? (lang === 'ar' ? '🔴 جاري التسجيل… اضغط مرة ثانية للإرسال' : '🔴 Recording… tap mic again to send') : t('ai_placeholder')}
                style={{
                  flex: 1, padding: '13px 16px', borderRadius: R.pill, outline: 'none', fontSize: '0.95rem',
                  background: recording ? '#fff0f0' : C.white, color: C.text,
                  border: '1.5px solid ' + (recording ? '#f87171' : C.greyMid),
                  transition: 'border-color 0.2s, background 0.2s',
                }}
              />
              {micSupported && (
                <button
                  onClick={toggleMic}
                  disabled={busy}
                  title={recording ? (lang === 'ar' ? 'إيقاف وإرسال' : 'Stop & send') : (lang === 'ar' ? 'تحدث' : 'Speak')}
                  style={{
                    width: 48, height: 48, borderRadius: '50%', border: 'none',
                    cursor: busy ? 'wait' : 'pointer', flexShrink: 0,
                    background: recording ? '#ef4444' : C.greyMid,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: recording ? '0 0 0 4px rgba(239,68,68,0.25)' : 'none',
                    animation: recording ? 'glowPulse 1.2s ease-in-out infinite' : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  <Icon name="mic" size={20} color={recording ? '#fff' : C.ink} />
                </button>
              )}
              <button onClick={() => send()} disabled={busy || recording} aria-label="Send" style={{
                width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: (busy || recording) ? 'wait' : 'pointer',
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
