import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { translations } from '../i18n/translations'
import { cloudSpeak, stopCloud } from '../utils/cloudTts'

const SettingsCtx = createContext(null)

// Rank voices for a language: prefer high-quality online "Google" voices (Chrome
// ships an Arabic one even when the OS has none), then known good named voices,
// then the platform default, then anything matching the language.
function pickBest(voices, target, preferredURI) {
  const langVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith(target))
  if (preferredURI) {
    const exact = langVoices.find((v) => v.voiceURI === preferredURI)
    if (exact) return exact
  }
  return (
    langVoices.find((v) => /google/i.test(v.name)) ||
    langVoices.find((v) => /naayf|hoda|salma|zariyah|laila|maged|tarik|microsoft/i.test(v.name)) ||
    langVoices.find((v) => v.default) ||
    langVoices[0] ||
    null
  )
}

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('rakna_theme') || 'light')
  const [lang, setLang] = useState(() => localStorage.getItem('rakna_lang') || 'ar') // Arabic by default
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('rakna_font')) || 1)
  const [voice, setVoice] = useState(() => localStorage.getItem('rakna_voice') === '1')
  const [voices, setVoices] = useState([])
  const [voiceURI, setVoiceURI] = useState(() => localStorage.getItem('rakna_voice_uri') || '')

  // theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('rakna_theme', theme)
  }, [theme])

  // language + direction
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('rakna_lang', lang)
  }, [lang])

  // text/display size — zoom the whole app uniformly
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.style.zoom = String(fontScale)
    localStorage.setItem('rakna_font', String(fontScale))
  }, [fontScale])

  useEffect(() => { localStorage.setItem('rakna_voice', voice ? '1' : '0') }, [voice])
  useEffect(() => { localStorage.setItem('rakna_voice_uri', voiceURI) }, [voiceURI])

  // load TTS voices (they arrive asynchronously, and again when online voices download)
  useEffect(() => {
    const synth = typeof window !== 'undefined' && window.speechSynthesis
    if (!synth) return
    const load = () => setVoices(synth.getVoices() || [])
    load()
    synth.addEventListener?.('voiceschanged', load)
    return () => synth.removeEventListener?.('voiceschanged', load)
  }, [])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key

  // voices available for the current language (for the Settings picker)
  const langVoices = useMemo(() => {
    const target = lang === 'ar' ? 'ar' : 'en'
    return voices.filter((v) => v.lang?.toLowerCase().startsWith(target))
  }, [voices, lang])

  // low-level speak: try the clear CLOUD voice first (if a TTS key is set in
  // Vercel), otherwise fall back to the device's built-in voice.
  const utter = useCallback(async (text, uri) => {
    if (!text) return
    stopCloud()
    const spokeInCloud = await cloudSpeak(text, lang)
    if (spokeInCloud) return
    const synth = typeof window !== 'undefined' && window.speechSynthesis
    if (!synth) return
    try {
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      const target = lang === 'ar' ? 'ar' : 'en'
      u.lang = lang === 'ar' ? 'ar-SA' : 'en-US'
      u.rate = lang === 'ar' ? 0.9 : 0.95 // a touch slower in Arabic for clarity
      u.pitch = 1
      const chosen = pickBest(synth.getVoices(), target, uri ?? voiceURI)
      if (chosen) u.voice = chosen
      synth.speak(u)
    } catch { /* not supported */ }
  }, [lang, voiceURI])

  // voice guidance — only speaks when the user enabled it
  const speak = useCallback((text) => { if (voice) utter(text) }, [voice, utter])

  // preview a voice from Settings (works even if guidance is off)
  const previewVoice = useCallback((uri) => utter(translations[lang]?.voice_sample || 'Hello, I am Raknoosh.', uri), [utter, lang])

  return (
    <SettingsCtx.Provider value={{
      theme, setTheme, toggleTheme,
      lang, setLang, t, isRTL: lang === 'ar',
      fontScale, setFontScale,
      voice, setVoice, speak,
      langVoices, voiceURI, setVoiceURI, previewVoice,
    }}>
      {children}
    </SettingsCtx.Provider>
  )
}

export const useSettings = () => useContext(SettingsCtx)
