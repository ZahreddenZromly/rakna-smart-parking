import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, setUserRole, setUserActive, setUserLot, isOnline, createOperator } from '../../firebase/adminService'
import { PARKING_LOTS } from '../../utils/constants'
import Icon from '../../components/common/Icon'

export default function AdminUsers() {
  const { t }       = useSettings()
  const { user: me } = useAuth()
  const [users,   setUsers]   = useState([])
  const [q,       setQ]       = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setUsers(await getAllUsers()) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toggleRole   = async (u) => {
    const next = u.role === 'admin' ? 'user' : 'admin'
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, role: next } : x))
    try { await setUserRole(u.id, next) } catch { load() }
  }
  const toggleActive = async (u) => {
    const next = u.active === false
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, active: next } : x))
    try { await setUserActive(u.id, next) } catch { load() }
  }

  const [assigningId, setAssigningId] = useState(null)
  const [showAddOp, setShowAddOp] = useState(false)
  const [opForm, setOpForm] = useState({ name: '', email: '', password: '', lotId: '' })
  const [opBusy, setOpBusy] = useState(false)
  const [opErr, setOpErr] = useState('')

  const addOperator = async () => {
    if (!opForm.email || !opForm.password || !opForm.lotId) { setOpErr('يرجى تعبئة جميع الحقول'); return }
    setOpBusy(true); setOpErr('')
    try {
      await createOperator(opForm)
      setShowAddOp(false)
      setOpForm({ name: '', email: '', password: '', lotId: '' })
      await load()
    } catch (e) {
      setOpErr(e.code === 'auth/email-already-in-use' ? 'هذا البريد مسجل مسبقاً' : 'حدث خطأ، حاول مرة أخرى')
    }
    setOpBusy(false)
  }

  const toggleOperator = async (u) => {
    const next = u.role === 'operator' ? 'user' : 'operator'
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, role: next } : x))
    try { await setUserRole(u.id, next) } catch { load() }
  }

  const assignLot = async (u, lotId) => {
    setAssigningId(null)
    setUsers((list) => list.map((x) => x.id === u.id ? { ...x, lotId } : x))
    try { await setUserLot(u.id, lotId) } catch { load() }
  }

  const filtered = users.filter((u) => {
    const s = q.toLowerCase()
    return !s || (u.name||'').toLowerCase().includes(s) || (u.email||'').toLowerCase().includes(s) || (u.phone||'').includes(s)
  })

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, margin: '8px 0 14px', fontFamily: FONT }}>{t('a_users')} ({users.length})</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => setShowAddOp(true)} style={{
          background: 'var(--brand)', color: 'var(--on-ink)', border: 'none', outline: 'none',
          padding: '10px 18px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer',
          boxShadow: SHADOW.brand, fontFamily: FONT, fontSize: '0.88rem',
        }}>+ إضافة مشغل جديد</button>
      </div>

      <input
        value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search_users')}
        style={{ width: '100%', padding: '13px 16px', border: '1.5px solid var(--border)', borderRadius: R.md, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', background: C.white, color: C.black, marginBottom: 16, fontFamily: FONT }}
      />
      {loading ? <p style={{ color: C.textMuted, fontFamily: FONT }}>{t('loading')}</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((u) => {
            const online = isOnline(u)
            const admin  = u.role === 'admin'
            const active = u.active !== false
            return (
              <div key={u.id} style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="user" size={24} color="var(--brand)" />
                  </div>
                  <span style={{ position: 'absolute', bottom: 0, insetInlineEnd: 0, width: 12, height: 12, borderRadius: '50%', background: online ? C.available : C.textMuted, border: '2px solid ' + C.white }} />
                </div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ color: C.black, fontSize: '0.95rem', fontFamily: FONT }}>{u.name || '—'}</strong>
                    {admin  && <Tag bg="#0984E3">{t('role_admin')}</Tag>}
                    {!active && <Tag bg={C.danger}>{t('inactive')}</Tag>}
                    <Tag bg={online ? C.available : C.textMuted}>{online ? t('online') : t('offline')}</Tag>
                  </div>
                  <div style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: 2, fontFamily: FONT }}>{u.email || u.phone || u.id}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>

                  <button onClick={() => toggleActive(u)} disabled={u.id === me?.uid} style={{
                    padding: '8px 12px', borderRadius: R.pill, border: 'none', outline: 'none',
                    background: active ? 'rgba(209,67,67,0.1)' : 'rgba(47,143,91,0.1)',
                    color: active ? 'var(--error)' : 'var(--success)',
                    fontWeight: 700, fontSize: '0.76rem',
                    cursor: u.id === me?.uid ? 'not-allowed' : 'pointer', opacity: u.id === me?.uid ? 0.5 : 1, fontFamily: FONT,
                  }}>{active ? t('deactivate') : t('activate')}</button>
                  <button onClick={() => toggleOperator(u)} disabled={u.id === me?.uid} style={{
                    padding: '8px 12px', borderRadius: R.pill, border: 'none', outline: 'none',
                    background: u.role === 'operator' ? 'rgba(165,94,234,0.1)' : 'rgba(9,132,227,0.1)',
                    color: u.role === 'operator' ? '#A55EEA' : '#0984E3',
                    fontWeight: 700, fontSize: '0.76rem',
                    cursor: u.id === me?.uid ? 'not-allowed' : 'pointer', opacity: u.id === me?.uid ? 0.5 : 1, fontFamily: FONT,
                  }}>{u.role === 'operator' ? 'إلغاء المشغل' : 'جعله مشغل'}</button>
                  {u.role === 'operator' && (
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setAssigningId(assigningId === u.id ? null : u.id)} style={{
                        padding: '8px 12px', borderRadius: R.pill, border: '1.5px solid var(--border)', outline: 'none',
                        background: 'white', color: C.black, fontWeight: 600, fontSize: '0.76rem', cursor: 'pointer', fontFamily: FONT,
                      }}>
                        {u.lotId ? PARKING_LOTS.find(l => l.id === u.lotId)?.name || 'موقف' : 'تعيين موقف'}
                      </button>
                      {assigningId === u.id && (
                        <div style={{
                          position: 'absolute', top: '110%', insetInlineStart: 0, zIndex: 50,
                          background: 'white', borderRadius: R.md, boxShadow: SHADOW.float,
                          border: '1px solid var(--border)', minWidth: 180,
                        }}>
                          {PARKING_LOTS.map(lot => (
                            <button key={lot.id} onClick={() => assignLot(u, lot.id)} style={{
                              width: '100%', padding: '10px 14px', background: u.lotId === lot.id ? 'var(--brand-soft)' : 'white',
                              border: 'none', outline: 'none', cursor: 'pointer', textAlign: 'start',
                              color: u.lotId === lot.id ? 'var(--brand)' : C.black, fontWeight: u.lotId === lot.id ? 700 : 500,
                              fontSize: '0.82rem', fontFamily: FONT,
                            }}>{lot.name}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {showAddOp && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setShowAddOp(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: 440, background: C.white, borderRadius: R.card, padding: 24, boxShadow: SHADOW.float }}>
            <h3 style={{ margin: '0 0 16px', color: C.black, fontFamily: FONT }}>إضافة مشغل جديد</h3>
            {[
              { k: 'name',     label: 'الاسم',              ph: 'اسم المشغل',         type: 'text' },
              { k: 'email',    label: 'البريد الإلكتروني',  ph: 'operator@rakna.ly',  type: 'email' },
              { k: 'password', label: 'كلمة المرور',        ph: '••••••••',            type: 'password' },
            ].map((f) => (
              <div key={f.k} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.82rem', fontFamily: FONT }}>{f.label}</label>
                <input type={f.type} value={opForm[f.k]} placeholder={f.ph}
                  onChange={(e) => setOpForm(p => ({ ...p, [f.k]: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: R.md, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: FONT }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.82rem', fontFamily: FONT }}>الموقف</label>
              <select value={opForm.lotId} onChange={(e) => setOpForm(p => ({ ...p, lotId: e.target.value }))}
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: R.md, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: FONT }}>
                <option value=''>-- اختر موقفاً --</option>
                {PARKING_LOTS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            {opErr && <p style={{ color: 'var(--error)', fontSize: '0.82rem', margin: '0 0 12px', fontFamily: FONT }}>{opErr}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowAddOp(false)} style={{ flex: 1, padding: 13, borderRadius: R.pill, border: '1.5px solid var(--border)', outline: 'none', background: C.white, color: C.black, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>إلغاء</button>
              <button onClick={addOperator} disabled={opBusy} style={{ flex: 2, padding: 13, borderRadius: R.pill, border: 'none', outline: 'none', background: 'var(--brand)', color: 'var(--on-ink)', fontWeight: 700, cursor: opBusy ? 'wait' : 'pointer', opacity: opBusy ? 0.7 : 1, fontFamily: FONT }}>
                {opBusy ? 'جاري الإنشاء...' : 'إنشاء حساب المشغل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function Tag({ bg, children }) {
  return <span style={{ background: bg + '22', color: bg, fontWeight: 700, fontSize: '0.62rem', padding: '2px 8px', borderRadius: 999, fontFamily: FONT }}>{children}</span>
}