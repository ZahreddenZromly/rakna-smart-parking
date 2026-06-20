import { useState, useEffect, useRef } from 'react'
import { C, R, SHADOW } from '../../styles/theme'
import { getAds } from '../../firebase/contentService'
import Icon from '../common/Icon'

export default function AdsCarousel() {
  const [ads, setAds] = useState([])
  const [i, setI] = useState(0)
  const touchX = useRef(null)

  useEffect(() => { getAds().then(setAds) }, [])

  // auto-rotate every 4s
  useEffect(() => {
    if (ads.length < 2) return
    const id = setInterval(() => setI((p) => (p + 1) % ads.length), 4000)
    return () => clearInterval(id)
  }, [ads])

  if (!ads.length) return null

  const go = (n) => setI((n + ads.length) % ads.length)
  const onStart = (e) => { touchX.current = e.touches[0].clientX }
  const onEnd = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (dx > 40) go(i - 1)
    else if (dx < -40) go(i + 1)
    touchX.current = null
  }

  return (
    <div style={{ marginTop: 18 }}>
      <div
        onTouchStart={onStart}
        onTouchEnd={onEnd}
        style={{ overflow: 'hidden', borderRadius: R.card }}
      >
        <div style={{ display: 'flex', transition: 'transform 0.4s ease', transform: `translateX(-${i * 100}%)` }}>
          {ads.map((ad) => (
            <div key={ad.id} style={{
              minWidth: '100%', boxSizing: 'border-box',
              background: ad.image ? `linear-gradient(90deg, rgba(15,14,14,0.75), rgba(15,14,14,0.25)), url(${ad.image}) center/cover` : (ad.bg || C.yellow),
              borderRadius: R.card, padding: 20, minHeight: 96,
              display: 'flex', alignItems: 'center', gap: 16, boxShadow: SHADOW.soft,
            }}>
              {!ad.image && <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(15,14,14,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="star" size={28} color="#0F0E0E" /></div>}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: ad.image ? '#fff' : '#0F0E0E', fontSize: '1.05rem', lineHeight: 1.2 }}>{ad.title}</div>
                <div style={{ color: ad.image ? 'rgba(255,255,255,0.85)' : 'rgba(15,14,14,0.7)', fontSize: '0.82rem', marginTop: 3 }}>{ad.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* dots */}
      {ads.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {ads.map((_, n) => (
            <button key={n} onClick={() => go(n)} aria-label={'slide ' + (n + 1)} style={{
              width: n === i ? 20 : 7, height: 7, borderRadius: 4, border: 'none', cursor: 'pointer',
              background: n === i ? C.black : C.greyMid, transition: 'all 0.2s', padding: 0,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}
