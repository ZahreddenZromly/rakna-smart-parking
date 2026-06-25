import { useState, useEffect } from 'react'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { getNews, likeNews, recordNewsView } from '../firebase/contentService'
import Icon from '../components/common/Icon'

export default function NewsPage() {
  const { t } = useSettings()
  const { user } = useAuth()
  const [news,  setNews]  = useState([])
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
    <MobileLayout bottomNav={false}>
      <TopBar title={t('news_feed')} />
      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
          {news.map((n) => (
            <div key={n.id} style={{
              background: C.white, borderRadius: R.card,
              padding: 'clamp(14px,3vw,20px)',
              boxShadow: SHADOW.soft,
            }}>
              {n.image && (
                <img
                  src={n.image} alt=""
                  style={{
                    width: '100%',
                    height: 'clamp(140px,25vw,200px)',
                    objectFit: 'cover',
                    borderRadius: R.md, marginBottom: 12,
                  }}
                />
              )}

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: R.md, flexShrink: 0,
                  background: 'var(--brand-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="news" size={22} color="var(--brand)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: C.black, fontSize: '1rem', fontFamily: FONT }}>{n.title}</div>
                  <div style={{ fontSize: '0.72rem', color: C.textMuted, marginTop: 2, fontFamily: FONT }}>{n.date}</div>
                </div>
              </div>

              <p style={{
                color: C.textSoft, fontSize: '0.9rem',
                lineHeight: 1.6, margin: '12px 0 14px',
                fontFamily: FONT,
              }}>
                {n.body}
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderTop: '1px solid var(--border)', paddingTop: 12,
              }}>
                <span style={{ fontSize: '0.78rem', color: C.textMuted, fontFamily: FONT }}>
                  {n.views || 0} {t('views')}
                </span>
                <button
                  onClick={() => toggleLike(n)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 16px', borderRadius: R.pill,
                    cursor: 'pointer', border: 'none', outline: 'none',
                    fontWeight: 700, fontSize: '0.82rem', fontFamily: FONT,
                    background: liked[n.id] ? 'var(--brand)' : 'var(--bg)',
                    color: liked[n.id] ? 'var(--on-ink)' : C.black,
                    transition: 'all 0.2s',
                  }}
                >
                  <Icon name="star" size={15} color={liked[n.id] ? 'var(--on-ink)' : C.black} />
                  {n.likes || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}