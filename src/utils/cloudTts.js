// Client side of the cloud voice. Calls /api/tts, plays the returned mp3,
// and caches identical phrases. Splits long text into sentence chunks so the
// full message is always spoken (Google Translate TTS caps per request).

const cache = new Map()
let currentAudios = []
let aborted = false
let noKey = false

function b64ToBlob(b64, mime) {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export function stopCloud() {
  aborted = true
  currentAudios.forEach(a => { try { a.pause(); a.currentTime = 0 } catch { /* ignore */ } })
  currentAudios = []
}

// Split text at sentence/clause boundaries into chunks ≤ maxLen chars
function splitChunks(text, maxLen = 160) {
  const segs = text
    .split(/(?<=[.!?؟،\n])\s*/)
    .flatMap(s => s.length > maxLen ? (s.match(new RegExp(`.{1,${maxLen}}`, 'g')) || [s]) : [s])
    .map(s => s.trim())
    .filter(Boolean)

  const chunks = []
  let cur = ''
  for (const s of segs) {
    const joined = cur ? cur + ' ' + s : s
    if (joined.length <= maxLen) { cur = joined }
    else { if (cur) chunks.push(cur); cur = s }
  }
  if (cur) chunks.push(cur)
  return chunks.length ? chunks : [text.slice(0, maxLen)]
}

async function fetchAudioUrl(chunk, lang) {
  const key = lang + '\x00' + chunk
  if (cache.has(key)) return cache.get(key)
  const r = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: chunk, lang }),
  })
  if (r.status === 503) { noKey = true; return null }
  if (!r.ok) return null
  const data = await r.json()
  if (!data.audio) return null
  const url = URL.createObjectURL(b64ToBlob(data.audio, data.mime || 'audio/mpeg'))
  cache.set(key, url)
  return url
}

export async function cloudSpeak(text, lang) {
  if (noKey || !text || typeof window === 'undefined') return false
  stopCloud()
  aborted = false
  try {
    const parts = splitChunks(text.trim())
    const urls = await Promise.all(parts.map(p => fetchAudioUrl(p, lang)))
    const audios = urls.filter(Boolean).map(u => new Audio(u))
    if (!audios.length) return false
    currentAudios = audios
    for (const a of audios) {
      if (aborted) break
      await new Promise(resolve => { a.onended = resolve; a.onerror = resolve; a.play().catch(resolve) })
    }
    return true
  } catch {
    return false
  }
}
