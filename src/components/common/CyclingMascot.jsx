import { useState, useEffect } from 'react'
import Mascot from './Mascot'
import { ALL_MOODS } from '../../utils/raknoushMoods'

// Raknoush that rotates through moods on an interval — used wherever we want him
// to feel alive and show his whole personality (AI assistant, dashboards, news…).
// Pass `forced` to pin a single mood (e.g. 'thinking' while the AI is replying).
export default function CyclingMascot({
  size = 52,
  moods = ALL_MOODS,
  intervalMs = 2600,
  shuffle = true,
  forced = null,
  style,
}) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (forced || moods.length < 2) return
    const id = setInterval(() => {
      setI((n) => {
        if (!shuffle) return (n + 1) % moods.length
        let r
        do { r = Math.floor(Math.random() * moods.length) } while (r === n && moods.length > 1)
        return r
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [forced, moods.length, intervalMs, shuffle])

  const mood = forced || moods[i % moods.length] || 'idle'

  // keying by mood re-triggers the little pop animation on every change
  return (
    <span key={mood} className="mascot-pop" style={{ display: 'inline-flex', ...style }}>
      <Mascot size={size} mood={mood} />
    </span>
  )
}
