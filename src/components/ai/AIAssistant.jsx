import { useState, useRef, useEffect } from 'react'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Icon from '../common/Icon'
import { PARKING_LOTS } from '../../utils/constants'
import { LOT_SPOTS, ZONE_META, ZONE_ORDER } from '../../utils/spotsData'

// Build a live snapshot of parking data to ground the assistant
function buildContext() {
  const lots = PARKING_LOTS.map((l) => ({
    name: l.name, address: l.address, available: l.availableSpots, total: l.totalSpots, price: l.pricePerHour,
  }))
  const layout = LOT_SPOTS['1']
  const zones = layout ? ZONE_ORDER.filter((z) => layout.zones[z]).map((z) => ({
    prefix: ZONE_META[z].prefix, label: ZONE_META[z].label,
    free: layout.zones[z].spots.filter((s) => s.status === 'available').length,
    total: layout.zones[z].spots.length,
  })) : []
  return { lots, zones }
}

// Offline / no-key fallback — answers common questions straight from the data
function ruleFallback(q, ctx, lang) {
  const text = q.toLowerCase()
  const ar = lang === 'ar'
  const lots = [...ctx.lots]
  if (/cheap|أرخص|سعر|price/.test(text)) {
    const c = lots.filter((l) => l.available > 0).sort((a, b) => a.price - b.price)[0] || lots[0]
    return ar
      ? `أرخص خيار متاح هو ${c.name} بسعر ${c.price} دل/ساعة، وبه ${c.available} مكان متاح.`
      : `The cheapest available option is ${c.name} at ${c.price} LYD/hr with ${c.available} spots free.`
  }
  if (/free|available|space|متاح|مكان|فاضي/.test(text)) {
    const m = lots.slice().sort((a, b) => b.available - a.available)[0]
    return ar
      ? `أكثر موقف به أماكن الآن هو ${m.name} — ${m.available} من ${m.total} متاح.`
      : `Right now ${m.name} has the most space — ${m.available} of ${m.total} free.`
  }
  if (/hello|hi|salam|سلام|مرحبا|اهلا/.test(text)) {
    return ar ? 'مرحباً! كيف أساعدك في إيجاد موقف؟' : 'Hi! How can I help you find parking?'
  }
  return ar
    ? 'أستطيع المساعدة في المواقف والأسعار وإيجاد مكان متاح. جرّب: «أرخص موقف» أو «أين أركن؟». (لتفعيل الإجابات الكاملة بالذكاء الاصطناعي أضف مفتاح API.)'
    : 'I can help with parking, prices and finding a free spot. Try: "cheapest parking" or "where can I park?". (Add an AI key for full answers.)'
}

export default function AIAssistant() {
  const { t, lang, isRTL } = useSettings()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([{ role: 'assistant', content: t('ai_greeting') }])
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, busy, open])

  const send = async () => {
    const q = input.trim()
    if (!q || busy) return
    const next = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    setBusy(true)
    const ctx = buildContext()
    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.filter((m) => m.role !== 'system'), context: ctx, lang }),
      })
      if (!r.ok) throw new Error('api')
      const data = await r.json()
      const reply = data.text || ruleFallback(q, ctx, lang)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: ruleFallback(q, ctx, lang) }])
    }
    setBusy(false)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={t('ai_assistant')} style={{
          position: 'fixed', bottom: 92, insetInlineEnd: 'calc(50% - 215px + 18px)', zIndex: 1500,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: C.ink, color: C.onInk, boxShadow: SHADOW.float,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="sparkle" size={26} color={C.yellow} />
        </button>
      )}

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1600, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: FONT }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', animation: 'fadeIn 0.2s ease' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 430, height: '80vh',
            background: C.grey, borderTopLeftRadius: 28, borderTopRightRadius: 28,
            display: 'flex', flexDirection: 'column', boxShadow: SHADOW.float, animation: 'sheetUp 0.3s ease',
          }}>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px', borderBottom: '1px solid ' + C.greyMid }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="sparkle" size={22} color={C.yellow} />
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
                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                  <div style={{
                    padding: '11px 14px', borderRadius: 16, fontSize: '0.9rem', lineHeight: 1.5,
                    background: m.role === 'user' ? C.yellow : C.white,
                    color: m.role === 'user' ? C.ink : C.black,
                    borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: m.role === 'user' ? 16 : 4,
                    boxShadow: SHADOW.soft, whiteSpace: 'pre-wrap',
                  }}>{m.content}</div>
                </div>
              ))}
              {busy && (
                <div style={{ alignSelf: 'flex-start', color: C.textMuted, fontSize: '0.85rem', padding: '6px 4px' }}>{t('ai_thinking')}</div>
              )}
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
              <button onClick={send} disabled={busy} aria-label="Send" style={{
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
