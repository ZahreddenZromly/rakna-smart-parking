// Vercel serverless function — clear cloud Text-to-Speech (great Arabic).
// Multi-provider: set the env vars for ANY ONE provider in Vercel and it's used.
// Keys are SECRET (server-side only). If none is set → 503 and the client falls
// back to the device's built-in voice.
//
//   Azure  (most native Arabic neural voices):
//     AZURE_SPEECH_KEY, AZURE_SPEECH_REGION (e.g. "westeurope")
//     optional AZURE_TTS_VOICE (default ar-SA-ZariyahNeural)
//   Google Cloud TTS:
//     GOOGLE_TTS_KEY   optional GOOGLE_TTS_VOICE (default ar-XA-Wavenet-B)
//   ElevenLabs (easiest signup):
//     ELEVENLABS_API_KEY  optional ELEVENLABS_VOICE_ID

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return }
  const { text, lang = 'ar' } = req.body || {}
  if (!text || !String(text).trim()) { res.status(400).json({ error: 'no_text' }); return }
  const ar = lang === 'ar'

  try {
    let audioB64 = null

    if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
      const region = process.env.AZURE_SPEECH_REGION
      const voice = process.env.AZURE_TTS_VOICE || (ar ? 'ar-SA-ZariyahNeural' : 'en-US-JennyNeural')
      const ssml = `<speak version='1.0' xml:lang='${ar ? 'ar-SA' : 'en-US'}'><voice name='${voice}'><prosody rate='${ar ? '-6%' : '0%'}'>${escapeXml(text)}</prosody></voice></speak>`
      const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        },
        body: ssml,
      })
      if (!r.ok) throw new Error('azure ' + r.status)
      audioB64 = Buffer.from(await r.arrayBuffer()).toString('base64')
    } else if (process.env.GOOGLE_TTS_KEY) {
      const voice = process.env.GOOGLE_TTS_VOICE || (ar ? 'ar-XA-Wavenet-B' : 'en-US-Neural2-C')
      const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: ar ? 'ar-XA' : 'en-US', name: voice },
          audioConfig: { audioEncoding: 'MP3', speakingRate: ar ? 0.95 : 1.0 },
        }),
      })
      if (!r.ok) throw new Error('google ' + r.status)
      audioB64 = (await r.json()).audioContent
    } else if (process.env.ELEVENLABS_API_KEY) {
      const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
      })
      if (!r.ok) throw new Error('eleven ' + r.status)
      audioB64 = Buffer.from(await r.arrayBuffer()).toString('base64')
    } else {
      res.status(503).json({ error: 'no_key' })
      return
    }

    res.setHeader('Cache-Control', 's-maxage=86400') // cache identical phrases at the edge
    res.status(200).json({ audio: audioB64, mime: 'audio/mpeg' })
  } catch (e) {
    res.status(500).json({ error: 'failed', detail: String(e?.message || e) })
  }
}
