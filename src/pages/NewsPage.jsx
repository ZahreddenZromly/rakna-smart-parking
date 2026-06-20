import { useState, useEffect } from 'react'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { getNews, likeNews, recordNewsView } from '../firebase/contentService'
import Icon from '../components/common/Icon'

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 20 }}>
        {news.map((n) => (
          <div key={n.id} style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft }}>
            {n.image && <img src={n.image} alt="" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: R.md, marginBottom: 12 }} />}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: R.md, background: C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="news" size={24} color={C.ink} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.black, fontSize: '1rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.72rem', color: C.textMuted, marginTop: 2 }}>{n.date}</div>
              </div>
            </div>
            <p style={{ color: C.textSoft, fontSize: '0.9rem', lineHeight: 1.55, margin: '12px 0 14px' }}>{n.body}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid ' + C.grey, paddingTop: 12 }}>
              <span style={{ fontSize: '0.78rem', color: C.textMuted }}>{n.views || 0} {t('views')}</span>
              <button onClick={() => toggleLike(n)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: R.pill, cursor: 'pointer',
                border: 'none', fontWeight: 700, fontSize: '0.82rem',
                background: liked[n.id] ? C.yellow : C.grey, color: liked[n.id] ? C.ink : C.black,
              }}>
                <Icon name="star" size={15} color={liked[n.id] ? C.ink : C.black} /> {n.likes || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </MobileLayout>
  )
}
