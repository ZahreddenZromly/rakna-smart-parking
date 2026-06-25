import { useState, useEffect, useRef } from 'react'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { db } from '../../firebase/config'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { DEFAULT_ADS } from '../../firebase/contentService'

export default function AdsCarousel() {
  const [ads,     setAds]     = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const touchX = useRef(null)

  // تحديث تلقائي من Firebase
  useEffect(() => {
    const q = query(collection(db, 'ads'), orderBy('order', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setAds(rows.length ? rows : DEFAULT_ADS)
      setLoading(false)
    }, () => { setAds(DEFAULT_ADS); setLoading(false) })
    return unsub
  }, [])

  // تمرير تلقائي كل 4 ثوان
  useEffect(() => {
    if (ads.length < 2) return
    const id = setInterval(() => setCurrent((p) => (p + 1) % ads.length), 4000)
    return () => clearInterval(id)
  }, [ads.length])

  const go = (n) => setCurrent((n + ads.length) % ads.length)

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchX.current == null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1))
    touchX.current = null
  }

  if (loading) return (
    <div style={{ marginTop: 18, borderRadius: R.card, background: C.greyMid, aspectRatio: '16/7', animation: 'pulse 1.5s ease infinite' }} />
  )
  if (!ads.length) return null

  return (
    <div style={{ marginTop: 18 }}>
      {/* الحاوية الخارجية */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: R.card,
          aspectRatio: '16/7',
          boxShadow: SHADOW.card,
        }}
      >
        {/* كل الإعلانات مكدسة فوق بعض */}
        {ads.map((ad, idx) => (
          <div
            key={ad.id}
            style={{
              position: 'absolute', inset: 0,
              opacity: idx === current ? 1 : 0,
              transform: idx === current ? 'scale(1)' : 'scale(1.02)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              pointerEvents: idx === current ? 'auto' : 'none',
            }}
          >
            {/* الصورة أو اللون */}
            {ad.image ? (
              <img
                src={ad.image}
                alt={ad.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: ad.bg || 'var(--brand)' }} />
            )}

            {/* overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: ad.image
                ? 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
                : 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
            }} />

            {/* النص في الأسفل */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '16px 20px',
              display: 'flex', alignItems: 'flex-end', gap: 12,
            }}>
              {!ad.image && (
                <span style={{ fontSize: 28, flexShrink: 0 }}>{ad.emoji || '🎉'}</span>
              )}
              <div>
                <div style={{
                  fontWeight: 800, color: '#fff',
                  fontSize: 'clamp(0.95rem,2.5vw,1.15rem)',
                  lineHeight: 1.25, fontFamily: FONT,
                  textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                }}>
                  {ad.title}
                </div>
                {ad.subtitle && (
                  <div style={{
                    color: 'rgba(255,255,255,0.88)',
                    fontSize: 'clamp(0.75rem,2vw,0.85rem)',
                    marginTop: 3, fontFamily: FONT,
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}>
                    {ad.subtitle}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* نقاط التنقل */}
      {ads.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {ads.map((_, n) => (
            <button key={n} onClick={() => go(n)} style={{
              width: n === current ? 22 : 7, height: 7,
              borderRadius: 4, border: 'none', outline: 'none',
              cursor: 'pointer', padding: 0,
              background: n === current ? 'var(--brand)' : C.greyMid,
              transition: 'all 0.25s',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}