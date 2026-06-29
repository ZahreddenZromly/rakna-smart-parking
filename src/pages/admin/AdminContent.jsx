import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import {
  getAds, getNews, addAd, updateAd, deleteAd, addNews, updateNews, deleteNews,
} from '../../firebase/contentService'
import { fileToCompressedDataURL, dataUrlKb } from '../../utils/image'
import Icon from '../../components/common/Icon'

const TABS = ['ads', 'news']

export default function AdminContent() {
  const { t } = useSettings()
  const [tab, setTab] = useState('ads')
  const [ads, setAds] = useState([])
  const [news, setNews] = useState([])
  const [editing, setEditing] = useState(null) // {type, item|null}

  const load = async () => {
    try { setAds(await getAds()); setNews(await getNews()) } catch { /* ignore */ }
  }
  useEffect(() => { load() }, [])

  const isDefault = (id) => String(id).startsWith('a') === false ? false : false // defaults have ids a1/n1 (no firestore)
  const isSeed = (id) => /^[an]\d+$/.test(String(id))

  const onSave = async (type, data, id) => {
    try {
      if (type === 'ads') id && !isSeed(id) ? await updateAd(id, data) : await addAd(data)
      else id && !isSeed(id) ? await updateNews(id, data) : await addNews(data)
      setEditing(null)
      await load()
    } catch (e) { alert('Save failed: ' + e.message) }
  }
  const onDelete = async (type, id) => {
    if (isSeed(id)) { alert('This is built-in sample content. Add your own to replace it.'); return }
    try {
      type === 'ads' ? await deleteAd(id) : await deleteNews(id)
      await load()
    } catch (e) { alert('Delete failed: ' + e.message) }
  }

  const list = tab === 'ads' ? ads : news

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, margin: '8px 0 16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, margin: 0 }}>{t('a_content')}</h1>
        <button onClick={() => setEditing({ type: tab, item: null })} style={{
          background: C.yellow, color: C.ink, border: 'none', padding: '10px 18px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.yellow,
        }}>+ {t('add_new')}</button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {TABS.map((x) => (
          <button key={x} onClick={() => setTab(x)} style={{
            padding: '9px 20px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
            background: tab === x ? C.ink : C.white, color: tab === x ? C.onInk : C.textSoft,
            fontWeight: 700, fontSize: '0.85rem', boxShadow: SHADOW.soft,
          }}>{x === 'ads' ? t('manage_ads') : t('manage_news')}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {list.map((item) => (
          <div key={item.id} style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {item.image ? (
                <img src={item.image} alt="" style={{ width: 52, height: 52, borderRadius: R.md, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 52, height: 52, borderRadius: R.md, background: item.bg || C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={tab === 'ads' ? 'star' : 'news'} size={24} color={C.ink} /></div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: C.black, fontSize: '0.92rem' }}>{item.title}</div>
                <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.subtitle || item.body}</div>
                {tab === 'news' && <div style={{ fontSize: '0.7rem', color: C.textMuted, marginTop: 4 }}>{item.views || 0} {t('views')} · {item.likes || 0} {t('like')}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setEditing({ type: tab, item })} style={{ flex: 1, padding: '8px', borderRadius: R.pill, border: '1.5px solid ' + C.greyMid, background: C.white, color: C.black, fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}>{t('edit_item')}</button>
              <button onClick={() => onDelete(tab, item.id)} style={{ flex: 1, padding: '8px', borderRadius: R.pill, border: 'none', background: '#FFE5E3', color: C.danger, fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>{t('delete')}</button>
            </div>
            {isSeed(item.id) && <div style={{ fontSize: '0.66rem', color: C.textMuted, marginTop: 8, textAlign: 'center' }}>sample</div>}
          </div>
        ))}
      </div>

      {editing && <Editor type={editing.type} item={editing.item} onClose={() => setEditing(null)} onSave={onSave} t={t} />}
    </AdminLayout>
  )
}

function Editor({ type, item, onClose, onSave, t }) {
  const [f, setF] = useState(item || (type === 'ads'
    ? { title: '', subtitle: '', emoji: '🎉', bg: '#F9DD4E', image: '' }
    : { title: '', body: '', emoji: '📰', image: '' }))
  const [imgBusy, setImgBusy] = useState(false)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  const pickImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgBusy(true)
    try {
      // 400px / 40% quality → ~15-50 KB as base64, well under Firestore's 1 MB limit
      const dataUrl = await fileToCompressedDataURL(file, 400, 0.4)
      if (dataUrlKb(dataUrl) > 800) {
        alert('Image still too large. Please try a smaller photo.')
      } else {
        set('image', dataUrl)
      }
    } catch (err) { alert('Could not process image: ' + err.message) }
    setImgBusy(false)
  }
  const field = { width: '100%', padding: '12px 14px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: C.white, color: C.text, marginBottom: 12 }
  const label = { display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.82rem' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 440, background: C.white, borderRadius: R.card, padding: 22, boxShadow: SHADOW.float, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', color: C.black }}>{item ? t('edit_item') : t('add_new')}</h3>

        <label style={label}>{t('title_label')}</label>
        <input style={field} value={f.title} onChange={(e) => set('title', e.target.value)} />

        {type === 'ads' ? (
          <>
            <label style={label}>{t('subtitle_label')}</label>
            <input style={field} value={f.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
          </>
        ) : (
          <>
            <label style={label}>{t('body_label')}</label>
            <textarea style={{ ...field, minHeight: 90, resize: 'vertical' }} value={f.body} onChange={(e) => set('body', e.target.value)} />
          </>
        )}

        {type === 'ads' && (
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Background color (shown when no image)</label>
            <input type="color" style={{ ...field, padding: 4, height: 46, marginBottom: 0 }} value={f.bg || '#F9DD4E'} onChange={(e) => set('bg', e.target.value)} />
          </div>
        )}

        <label style={label}>Image</label>
        {f.image && (
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <img src={f.image} alt="" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: R.md }} />
            <button type="button" onClick={() => set('image', '')} style={{ position: 'absolute', top: 8, insetInlineEnd: 8, width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer' }}>✕</button>
          </div>
        )}
        <label style={{ ...field, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', color: C.textSoft, marginBottom: 6 }}>
          {imgBusy ? 'Processing…' : 'Upload image'}
          <input type="file" accept="image/*" onChange={pickImage} style={{ display: 'none' }} />
        </label>
        <input style={field} value={(f.image || '').startsWith('data:') ? '' : (f.image || '')} onChange={(e) => set('image', e.target.value)} placeholder={t('image_url')} />

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', borderRadius: R.pill, border: '1.5px solid ' + C.greyMid, background: C.white, color: C.black, fontWeight: 600, cursor: 'pointer' }}>{t('cancel')}</button>
          <button onClick={() => f.title && onSave(type, f, item?.id)} style={{ flex: 2, padding: '13px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.yellow }}>{t('save')}</button>
        </div>
      </div>
    </div>
  )
}
