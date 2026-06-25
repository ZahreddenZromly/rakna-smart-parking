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

    const system = `You are "Raknoush" (ركنوش), the smart in-app assistant and mascot for Rakna (ركنة), a smart-parking app for central Tripoli, Libya.

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

    const client = new Anthropic({ apiKey })
    const msg = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,                       // headroom for adaptive thinking + a short answer
      thinking: { type: 'adaptive' },         // Claude decides how hard to think per question
      output_config: { effort: 'high' },      // smarter answers (GA, no beta header)
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const text = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
    res.status(200).json({ text })
  } catch (e) {
    res.status(500).json({ error: 'failed', detail: String(e?.message || e) })
  }
}
