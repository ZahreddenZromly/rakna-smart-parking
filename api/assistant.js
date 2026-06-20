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
      .map((l) => `- ${l.name} (${l.address}): ${l.available}/${l.total} free, ${l.price} LYD/hr`)
      .join('\n')
    const zones = (context.zones || [])
      .map((z) => `- Zone ${z.prefix} (${z.label}): ${z.free}/${z.total} free`)
      .join('\n')

    const system = `You are "Rakna Assistant", the in-app helper for the Rakna smart-parking app for the Bourguiba parking area in central Tripoli, Libya.
Reply in ${lang === 'ar' ? 'Arabic' : 'English'}. Be concise, friendly, and practical — 1–4 short sentences. Never invent lots, zones, or prices; use only the live data below. If asked something unrelated to parking, gently steer back.

LIVE PARKING DATA:
Lots:
${lots || '(none)'}

Zones in the main lot (A=Taxi, B=Reservation, C=Regular, D=Bus, E=Disability):
${zones || '(none)'}

When recommending, prefer zones/lots with more free spaces and lower price unless the user asks otherwise. You can suggest the user tap a zone to book, top up their wallet, or open the parking map.`

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
