/* global process, Buffer */
// Speech-to-text via Groq Whisper — works on iOS, Android, and all browsers.
// Uses the same GROQ_API_KEY already configured for the AI assistant.
// Returns 503 if no key is set (client falls back to Web Speech API).

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }

function cleanKey(raw) { return (raw || '').replace(/^﻿/, '').replace(/[^\x20-\x7E]/g, '').trim() }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })

  const key = cleanKey(process.env.GROQ_API_KEY)
  if (!key) return res.status(503).json({ error: 'no_key' })

  const { audio, lang = 'ar', mime = 'audio/webm' } = req.body || {}
  if (!audio) return res.status(400).json({ error: 'no_audio' })

  try {
    const buf = Buffer.from(audio, 'base64')

    // Map MIME type to a file extension Groq Whisper accepts
    const extMap = { 'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav' }
    const ext = extMap[mime] || 'webm'

    const form = new FormData()
    form.append('file', new Blob([buf], { type: mime }), `voice.${ext}`)
    form.append('model', 'whisper-large-v3-turbo')
    form.append('language', lang === 'ar' ? 'ar' : 'en')
    form.append('response_format', 'json')

    const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })

    if (!r.ok) {
      const detail = await r.text()
      throw new Error(`groq ${r.status}: ${detail.slice(0, 200)}`)
    }

    const data = await r.json()
    res.status(200).json({ text: (data.text || '').trim() })
  } catch (e) {
    res.status(500).json({ error: 'failed', detail: String(e?.message || e) })
  }
}
