// Vercel serverless function — the in-app AI assistant brain.
// FREE-FIRST: pick whichever key is set (all keys live ONLY here, server-side):
//   1. GEMINI_API_KEY  → Google Gemini (FREE tier, no card — recommended for MVP)
//   2. GROQ_API_KEY    → Groq (FREE, very fast Llama models)
//   3. ANTHROPIC_API_KEY → Claude (paid, best quality — optional)
// If none are set, returns 503 and the app falls back to its built-in offline engine.
//
// Get a free Gemini key: https://aistudio.google.com/apikey   (then set GEMINI_API_KEY in Vercel)
// Get a free Groq key:   https://console.groq.com/keys         (then set GROQ_API_KEY in Vercel)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { messages = [], context = {}, lang = 'en' } = req.body || {}
  const system = buildSystem(context, lang)

  try {
    if (process.env.GEMINI_API_KEY) {
      res.status(200).json({ text: await askGemini(system, messages), provider: 'gemini' })
      return
    }
    if (process.env.GROQ_API_KEY) {
      res.status(200).json({ text: await askGroq(system, messages), provider: 'groq' })
      return
    }
    if (process.env.ANTHROPIC_API_KEY) {
      res.status(200).json({ text: await askClaude(system, messages), provider: 'claude' })
      return
    }
    res.status(503).json({ error: 'no_key' })
  } catch (e) {
    res.status(500).json({ error: 'failed', detail: String(e?.message || e) })
  }
}

// --- shared: turn the app's message list into a clean alternating convo that
//     starts with a user turn (drops the leading UI greeting) ---
function convo(messages) {
  const out = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => ({ role: m.role, content: String(m.content) }))
  while (out.length && out[0].role !== 'user') out.shift()
  return out
}

// --- Google Gemini (free) ---
async function askGemini(system, messages) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`
  const contents = convo(messages).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
    }),
  })
  if (!r.ok) throw new Error('gemini ' + r.status + ' ' + (await r.text()).slice(0, 300))
  const data = await r.json()
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('').trim()
  if (!text) throw new Error('gemini empty')
  return text
}

// --- Groq (free, OpenAI-compatible) ---
async function askGroq(system, messages) {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 600,
      messages: [{ role: 'system', content: system }, ...convo(messages)],
    }),
  })
  if (!r.ok) throw new Error('groq ' + r.status + ' ' + (await r.text()).slice(0, 300))
  const data = await r.json()
  const text = data?.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('groq empty')
  return text
}

// --- Claude (paid, optional) ---
async function askClaude(system, messages) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8',
      max_tokens: 1024,
      system,
      messages: convo(messages),
    }),
  })
  if (!r.ok) throw new Error('anthropic ' + r.status + ' ' + (await r.text()).slice(0, 300))
  const data = await r.json()
  const text = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
  if (!text) throw new Error('anthropic empty')
  return text
}

// --- system prompt with live parking data ---
function buildSystem(context, lang) {
  const lots = (context.lots || [])
    .map((l) => `- ${l.name} (${l.address}): ${l.available}/${l.total} free, ${l.price} LYD/hr${l.full ? ' [FULL — queue available]' : ''}`)
    .join('\n')
  const zones = (context.zones || [])
    .map((z) => `- Zone ${z.prefix} (${z.label}): ${z.free}/${z.total} free`)
    .join('\n')
  const u = context.user || {}
  const userState = u.signedIn
    ? `Signed-in user: ${u.points} loyalty points, ${u.walletBalance} LYD wallet, ${u.vehicles} saved vehicle(s), ${u.activeBookings} active booking(s).`
    : 'The user is not signed in.'

  return `You are "Raknoush" (ركنوش), the smart in-app assistant and mascot for Rakna (ركنة), a smart-parking app for central Tripoli, Libya.

Reply in ${lang === 'ar' ? 'Arabic (use natural, friendly Libyan/MSA Arabic)' : 'English'}. Sound like a sharp, warm local helper — not a robot. Keep it tight: usually 1–3 short sentences, more only when the user genuinely needs the detail.

Be genuinely useful and proactive:
- Ground EVERY answer in the LIVE DATA below. Never invent lots, zones, prices, availability, or the user's numbers. If the data doesn't cover something, say so in one line and offer the closest helpful next step.
- When you recommend a lot or zone, say WHY in a few words (cheaper, more free spaces, closer) and point to the action the user can take next — the app shows tappable buttons beside your reply.
- Use the conversation so far to handle follow-ups ("and the cheapest one?", "what about buses?") without re-asking.
- Do the small math the user would want (e.g. "2 hours ≈ X LYD", "you have enough points for Y free hours") using the real numbers.
- If the user is stressed or in a hurry, lead with the single best answer first, then the detail.
- If asked something unrelated to parking, answer in one short line and steer back.

LIVE PARKING DATA:
Lots:
${lots || '(none)'}

Zones in the main lot (A=Taxi, B=Reservation, C=Regular, D=Bus, E=Disability):
${zones || '(none)'}

USER:
${userState}

WHAT THE APP CAN DO (you can guide the user to these — the app shows tappable action buttons alongside your reply):
- Find the cheapest or most-available lot and open it to book a spot
- Smart queue: if a lot is FULL, the user joins a waiting queue and is offered a spot (first-come-first-served) when one frees up
- Wallet (top up, pay), loyalty points (redeem for free hours), vehicles, bookings, news/offers, and "Rakna for Business" partner program

When recommending, prefer lots with more free spaces and lower price unless asked otherwise. Reference the user's real points/wallet/bookings when relevant. Keep it actionable.`
}
