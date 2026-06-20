import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, setUserRole, setUserActive, isOnline } from '../../firebase/adminService'
import Icon from '../../components/common/Icon'

export default function AdminUsers() {
  const { t } = useSettings()
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setUsers(await getAllUsers()) } catch { /* ignore */ }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toggleRole = async (u) => {
    const next = u.role === 'admin' ? 'user' : 'admin'
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, role: next } : x))
    try { await setUserRole(u.id, next) } catch { load() }
  }
  const toggleActive = async (u) => {
    const next = u.active === false
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, active: next } : x))
    try { await setUserActive(u.id, next) } catch { load() }
  }

  const filtered = users.filter((u) => {
    const s = q.toLowerCase()
    return !s || (u.name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s) || (u.phone || '').includes(s)
  })

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, margin: '8px 0 14px' }}>{t('a_users')} ({users.length})</h1>

      <input
        value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_users')}
        style={{ width: '100%', padding: '13px 16px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: C.white, color: C.text, marginBottom: 16 }}
      />

      {loading ? <p style={{ color: C.textMuted }}>{t('loading')}</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((u) => {
            const online = isOnline(u)
            const admin = u.role === 'admin'
            const active = u.active !== false
            return (
              <div key={u.id} style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="user" size={24} color={C.ink} /></div>
                  <span style={{ position: 'absolute', bottom: 0, insetInlineEnd: 0, width: 12, height: 12, borderRadius: '50%', background: online ? C.available : C.textMuted, border: '2px solid ' + C.white }} />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ color: C.black, fontSize: '0.95rem' }}>{u.name || '—'}</strong>
                    {admin && <Tag bg="#0984E3">{t('role_admin')}</Tag>}
                    {!active && <Tag bg={C.danger}>{t('inactive')}</Tag>}
                    <Tag bg={online ? C.available : C.textMuted}>{online ? t('online') : t('offline')}</Tag>
                  </div>
                  <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: 2 }}>{u.email || u.phone || u.id}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleRole(u)} disabled={u.id === me?.uid} style={{
                    padding: '8px 12px', borderRadius: R.pill, border: '1.5px solid ' + C.greyMid, background: C.white,
                    color: C.black, fontWeight: 600, fontSize: '0.76rem', cursor: u.id === me?.uid ? 'not-allowed' : 'pointer', opacity: u.id === me?.uid ? 0.5 : 1,
                  }}>{admin ? t('remove_admin') : t('make_admin')}</button>
                  <button onClick={() => toggleActive(u)} disabled={u.id === me?.uid} style={{
                    padding: '8px 12px', borderRadius: R.pill, border: 'none',
                    background: active ? '#FFE5E3' : '#D4F5DD', color: active ? C.danger : '#1A8F3C',
                    fontWeight: 700, fontSize: '0.76rem', cursor: u.id === me?.uid ? 'not-allowed' : 'pointer', opacity: u.id === me?.uid ? 0.5 : 1,
                  }}>{active ? t('deactivate') : t('activate')}</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}

function Tag({ bg, children }) {
  return <span style={{ background: bg + '22', color: bg, fontWeight: 700, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 999 }}>{children}</span>
}
