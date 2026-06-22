// Client side of the clear cloud voice. Calls /api/tts, plays the returned mp3,
// and caches identical phrases. Returns true if it actually spoke, so the caller
// can fall back to the device's built-in voice when no TTS key is configured.

const cache = new Map() // text -> object URL
let current = null      // the currently-playing Audio element
let noKey = false       // remember a 503 so we stop hitting the endpoint this session

function b64ToBlob(b64, mime) {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export function stopCloud() {
  if (current) { try { current.pause(); current.currentTime = 0 } catch { /* ignore */ } }
}

export async function cloudSpeak(text, lang) {
  if (noKey || !text || typeof window === 'undefined') return false
  try {
    let url = cache.get(text)
    if (!url) {
      const r = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      })
      if (r.status === 503) { noKey = true; return false } // no provider key set → use device voice
      if (!r.ok) return false
      const data = await r.json()
      if (!data.audio) return false
      url = URL.createObjectURL(b64ToBlob(data.audio, data.mime || 'audio/mpeg'))
      cache.set(text, url)
    }
    stopCloud()
    current = new Audio(url)
    await current.play().catch(() => {}) // autoplay may need a user gesture; harmless if blocked
    return true
  } catch {
    return false
  }
}
