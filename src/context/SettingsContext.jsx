import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations } from '../i18n/translations'

const SettingsCtx = createContext(null)

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('rakna_theme') || 'light')
  const [lang, setLang] = useState(() => localStorage.getItem('rakna_lang') || 'ar')
  const [fontScale, setFontScale] = useState(() => Number(localStorage.getItem('rakna_font')) || 1)
  const [voice, setVoice] = useState(() => localStorage.getItem('rakna_voice') === '1')

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

  useEffect(() => {
    localStorage.setItem('rakna_voice', voice ? '1' : '0')
  }, [voice])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key

  // voice guidance — speaks a phrase if the user enabled it (picks an Arabic voice when available)
  const speak = useCallback((text) => {
    if (!voice || typeof window === 'undefined' || !window.speechSynthesis || !text) return
    try {
      const synth = window.speechSynthesis
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      const target = lang === 'ar' ? 'ar' : 'en'
      u.lang = lang === 'ar' ? 'ar-SA' : 'en-US'
      const pick = () => {
        const voices = synth.getVoices()
        const match = voices.find((v) => v.lang?.toLowerCase().startsWith(target))
        if (match) u.voice = match
        u.rate = 0.95
        synth.speak(u)
      }
      // voices may load asynchronously the first time
      if (synth.getVoices().length) pick()
      else { synth.onvoiceschanged = pick; setTimeout(pick, 250) }
    } catch { /* not supported */ }
  }, [voice, lang])

  return (
    <SettingsCtx.Provider value={{
      theme, setTheme, toggleTheme,
      lang, setLang, t, isRTL: lang === 'ar',
      fontScale, setFontScale,
      voice, setVoice, speak,
    }}>
      {children}
    </SettingsCtx.Provider>
  )
}

export const useSettings = () => useContext(SettingsCtx)
