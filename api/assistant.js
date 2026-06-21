// Vercel serverless function — proxies the in-app AI assistant to Claude.
// The Anthropic API key is SECRET and lives only here (server-side), never in the client.
// Set ANTHROPIC_API_KEY in Vercel → Project → Settings → Environment Variables.
import Anthropic from '@anthropic-ai/sdk'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(503).json({ error: 'no_key' })
    return
  }

  try {
    const { messages = [], context = {}, lang = 'en' } = req.body || {}

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

    const system = `You are "Rukna", the smart in-app assistant for the Rakna smart-parking app for central Tripoli, Libya.
Reply in ${lang === 'ar' ? 'Arabic' : 'English'}. Be concise, friendly, and practical — 1–4 short sentences. Never invent lots, zones, prices, or the user's numbers; use only the live data below. If asked something unrelated to parking, gently steer back.

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

    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
    res.status(200).json({ text })
  } catch (e) {
    res.status(500).json({ error: 'failed', detail: String(e?.message || e) })
  }
}
