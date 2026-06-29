import { useState, useEffect } from 'react'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { getNews, likeNews, recordNewsView } from '../firebase/contentService'
import Icon from '../components/common/Icon'
import CyclingMascot from '../components/common/CyclingMascot'

export default function NewsPage() {
  const { t } = useSettings()
  const { user } = useAuth()
  const [news, setNews] = useState([])
  const [liked, setLiked] = useState({})

  useEffect(() => {
    let alive = true
    getNews().then((rows) => {
      if (!alive) return
      setNews(rows)
      rows.forEach((n) => recordNewsView(n.id, user?.uid))
    })
    return () => { alive = false }
  }, [user])

  const toggleLike = (n) => {
    if (liked[n.id]) return
    setLiked((l) => ({ ...l, [n.id]: true }))
    setNews((rows) => rows.map((r) => r.id === n.id ? { ...r, likes: (r.likes || 0) + 1 } : r))
    likeNews(n.id, user?.uid)
  }

  return (
    <MobileLayout bottomNav={false} bg={C.grey}>
      <TopBar title={t('news_feed')} />

      {/* Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, background: C.white,
        borderRadius: R.card, padding: '10px 14px', boxShadow: SHADOW.soft, marginBottom: 18,
      }}>
        <div style={{ flexShrink: 0, width: 52, display: 'flex', justifyContent: 'center' }}>
          <CyclingMascot size={52} intervalMs={2600} />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: C.black, fontFamily: FONT }}>{t('news_feed')}</div>
          <div style={{ fontSize: '0.8rem', color: C.textMuted, fontFamily: FONT }}>{t('raknoush_news')}</div>
        </div>
      </div>

      {/* News grid: 1 col → 2 col (640px) → 3 col (1024px) */}
      <div className="resp-3 stagger" style={{ paddingBottom: 20 }}>
        {news.map((n) => (
          <div key={n.id} style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft, display: 'flex', flexDirection: 'column' }}>
            {n.image && (
              <img src={n.image} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: R.md, marginBottom: 12 }} />
            )}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: R.md, background: C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="news" size={22} color={C.ink} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.black, fontSize: '0.97rem', fontFamily: FONT, lineHeight: 1.3 }}>{n.title}</div>
                <div style={{ fontSize: '0.72rem', color: C.textMuted, marginTop: 3, fontFamily: FONT }}>{n.date}</div>
              </div>
            </div>
            <p style={{ color: C.textSoft, fontSize: '0.88rem', lineHeight: 1.6, margin: '12px 0 14px', fontFamily: FONT, flex: 1 }}>{n.body}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid ' + C.grey, paddingTop: 12 }}>
              <span style={{ fontSize: '0.76rem', color: C.textMuted, fontFamily: FONT }}>{n.views || 0} {t('views')}</span>
              <button
                onClick={() => toggleLike(n)}
                className="press"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  borderRadius: R.pill, cursor: 'pointer', border: 'none',
                  fontWeight: 700, fontSize: '0.82rem', fontFamily: FONT,
                  background: liked[n.id] ? 'var(--brand)' : C.grey,
                  color: liked[n.id] ? '#fff' : C.black,
                }}
              >
                <Icon name="star" size={15} color={liked[n.id] ? '#fff' : C.black} /> {n.likes || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  )
}
