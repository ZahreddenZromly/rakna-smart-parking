import { useEffect, useState, useMemo } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Icon from '../../components/common/Icon'
import {
  subscribeOperators, addOperator, removeOperator, setOperatorStatus,
} from '../../firebase/operatorService'
import { PARKING_LOTS, getLotName } from '../../utils/constants'

const PLANS = ['basic', 'pro', 'enterprise']
const PLAN_COLOR = { basic: '#636e72', pro: '#0984E3', enterprise: '#6c5ce7' }
const PLAN_BG    = { basic: '#f0f0f0', pro: '#e8f4fd', enterprise: '#f0ecff' }

const EMPTY = { name: '', email: '', lotId: PARKING_LOTS[0]?.id || '', plan: 'basic', notes: '' }

const tsLabel = (ts) => {
  if (!ts?.seconds) return '—'
  return new Date(ts.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function AdminOperators() {
  const { t, lang } = useSettings()
  const [operators, setOperators] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [confirmDel, setConfirmDel] = useState(null)

  useEffect(() => subscribeOperators(setOperators), [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return [...operators]
      .filter(o => !q || o.name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q) || getLotName(PARKING_LOTS.find(l => l.id === o.lotId), lang)?.toLowerCase().includes(q))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [operators, search, lang])

  const stats = useMemo(() => ({
    total: operators.length,
    active: operators.filter(o => o.status === 'active').length,
    basic: operators.filter(o => o.plan === 'basic').length,
    pro: operators.filter(o => o.plan === 'pro').length,
    enterprise: operators.filter(o => o.plan === 'enterprise').length,
  }), [operators])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800) }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.lotId) return
    setSaving(true)
    try {
      await addOperator(form)
      setForm(EMPTY)
      setShowForm(false)
      showToast(t('op_added'))
    } catch { /* ignore */ }
    setSaving(false)
  }

  const copyLink = (op) => {
    const url = `${window.location.origin}/operator/dashboard?lot=${op.lotId}&email=${encodeURIComponent(op.email)}`
    navigator.clipboard.writeText(url).then(() => showToast(t('op_link_copied'))).catch(() => showToast(url))
  }

  const toggleStatus = (op) =>
    setOperatorStatus(op.id, op.status === 'active' ? 'inactive' : 'active')

  const handleDelete = async (id) => {
    await removeOperator(id)
    setConfirmDel(null)
    showToast('Operator removed.')
  }

  const lotName = (lotId) => {
    const lot = PARKING_LOTS.find(l => l.id === lotId)
    return lot ? getLotName(lot, lang) : '—'
  }

  return (
    <AdminLayout>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          background: C.ink, color: '#fff', padding: '10px 22px', borderRadius: R.pill,
          zIndex: 9999, fontWeight: 600, fontSize: '0.88rem', fontFamily: FONT,
          animation: 'popIn 0.22s ease',
        }}>
          {toast}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: C.white, borderRadius: R.card, padding: 28, maxWidth: 380, width: '100%', boxShadow: SHADOW.float, fontFamily: FONT }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: C.black, marginBottom: 8 }}>Remove Operator?</div>
            <div style={{ color: C.textMuted, fontSize: '0.9rem', marginBottom: 22 }}>
              This will remove <strong>{confirmDel.name}</strong>'s access immediately. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ flex: 1, padding: '12px', borderRadius: R.pill, border: `1.5px solid ${C.greyMid}`, background: C.white, cursor: 'pointer', fontWeight: 600, fontFamily: FONT }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDel.id)} style={{ flex: 1, padding: '12px', borderRadius: R.pill, border: 'none', background: C.danger, color: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: FONT }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', margin: '8px 0 20px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: 0, fontFamily: FONT }}>{t('operators_title')}</h1>
          <p style={{ color: C.textMuted, fontSize: '0.87rem', margin: '4px 0 0', fontFamily: FONT }}>{t('operators_sub')}</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '11px 20px', borderRadius: R.pill, border: 'none',
            background: showForm ? C.grey : 'var(--brand)',
            color: showForm ? C.text : '#fff',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: FONT,
            boxShadow: showForm ? 'none' : SHADOW.brand,
          }}
        >
          <Icon name={showForm ? 'back' : 'plus'} size={17} color={showForm ? C.text : '#fff'} />
          {showForm ? 'Cancel' : t('add_operator')}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',      value: stats.total,      color: C.ink },
          { label: 'Active',     value: stats.active,     color: '#00b894' },
          { label: t('plan_basic'),      value: stats.basic,      color: PLAN_COLOR.basic },
          { label: t('plan_pro'),        value: stats.pro,        color: PLAN_COLOR.pro },
          { label: t('plan_enterprise'), value: stats.enterprise, color: PLAN_COLOR.enterprise },
        ].map((s) => (
          <div key={s.label} style={{ background: C.white, borderRadius: R.card, padding: '14px 16px', boxShadow: SHADOW.soft, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, fontFamily: FONT }}>{s.value}</div>
            <div style={{ color: C.textMuted, fontSize: '0.78rem', fontFamily: FONT }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Operator Form */}
      {showForm && (
        <div style={{ background: C.white, borderRadius: R.card, padding: 24, boxShadow: SHADOW.card, marginBottom: 24, animation: 'popIn 0.22s ease' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: 800, color: C.black, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="plus" size={18} color="var(--brand)" /> {t('add_operator')}
          </h2>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: C.textSoft, marginBottom: 6, fontFamily: FONT }}>{t('op_name')} *</label>
                <input
                  required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ahmed Al-Masri"
                  style={{ width: '100%', padding: '11px 13px', borderRadius: R.md, border: `1.5px solid ${C.greyMid}`, fontFamily: FONT, fontSize: '0.92rem', color: C.text, background: C.white, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: C.textSoft, marginBottom: 6, fontFamily: FONT }}>{t('op_email')} *</label>
                <input
                  required type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="operator@example.com"
                  style={{ width: '100%', padding: '11px 13px', borderRadius: R.md, border: `1.5px solid ${C.greyMid}`, fontFamily: FONT, fontSize: '0.92rem', color: C.text, background: C.white, boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              {/* Lot */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: C.textSoft, marginBottom: 6, fontFamily: FONT }}>{t('op_lot')} *</label>
                <select
                  required value={form.lotId}
                  onChange={e => setForm(f => ({ ...f, lotId: e.target.value }))}
                  style={{ width: '100%', padding: '11px 13px', borderRadius: R.md, border: `1.5px solid ${C.greyMid}`, fontFamily: FONT, fontSize: '0.92rem', color: C.text, background: C.white, boxSizing: 'border-box', cursor: 'pointer', outline: 'none' }}
                >
                  {PARKING_LOTS.map(lot => (
                    <option key={lot.id} value={lot.id}>{getLotName(lot, lang)}</option>
                  ))}
                </select>
              </div>

              {/* Plan */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: C.textSoft, marginBottom: 6, fontFamily: FONT }}>{t('op_plan')}</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {PLANS.map(p => (
                    <button
                      key={p} type="button"
                      onClick={() => setForm(f => ({ ...f, plan: p }))}
                      style={{
                        flex: 1, padding: '11px 4px', borderRadius: R.md, cursor: 'pointer', fontFamily: FONT,
                        fontWeight: 700, fontSize: '0.78rem',
                        border: `1.5px solid ${form.plan === p ? PLAN_COLOR[p] : C.greyMid}`,
                        background: form.plan === p ? PLAN_BG[p] : C.white,
                        color: form.plan === p ? PLAN_COLOR[p] : C.textSoft,
                      }}
                    >
                      {t('plan_' + p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: C.textSoft, marginBottom: 6, fontFamily: FONT }}>{t('op_notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="e.g. Subscribed after trade fair, owns 2 lots, interested in upgrading"
                  style={{ width: '100%', padding: '11px 13px', borderRadius: R.md, border: `1.5px solid ${C.greyMid}`, fontFamily: FONT, fontSize: '0.9rem', color: C.text, background: C.white, boxSizing: 'border-box', resize: 'vertical', outline: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={saving}
              style={{
                marginTop: 18, padding: '13px 32px', borderRadius: R.pill, border: 'none',
                background: 'var(--brand)', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                fontFamily: FONT, cursor: saving ? 'wait' : 'pointer',
                boxShadow: SHADOW.brand, opacity: saving ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {saving ? 'Saving…' : <><Icon name="plus" size={16} color="#fff" /> {t('add_operator')}</>}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.white, borderRadius: R.pill, padding: '0 16px', height: 42, boxShadow: SHADOW.soft, marginBottom: 16 }}>
        <Icon name="search" size={16} color={C.textMuted} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email or lot…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: FONT, fontSize: '0.9rem', color: C.text }}
        />
        {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.textMuted, fontSize: '1.1rem' }}>×</button>}
      </div>

      {/* Operators grid */}
      {filtered.length === 0 ? (
        <div style={{ background: C.white, borderRadius: R.card, padding: '40px 24px', boxShadow: SHADOW.soft, textAlign: 'center' }}>
          <Icon name="shield" size={44} color={C.textMuted} strokeWidth={1.4} />
          <p style={{ color: C.textMuted, fontFamily: FONT, marginTop: 12 }}>
            {search ? 'No operators match your search.' : t('op_no_operators')}
          </p>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(op => (
            <OperatorCard
              key={op.id}
              op={op}
              lotName={lotName(op.lotId)}
              t={t}
              onCopy={() => copyLink(op)}
              onToggle={() => toggleStatus(op)}
              onDelete={() => setConfirmDel(op)}
            />
          ))}
        </div>
      )}
    </AdminLayout>
  )
}

function OperatorCard({ op, lotName, t, onCopy, onToggle, onDelete }) {
  const active = op.status === 'active'

  return (
    <div style={{ background: C.white, borderRadius: R.card, padding: 20, boxShadow: SHADOW.soft, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${PLAN_COLOR[op.plan] || '#636e72'} 0%, ${PLAN_COLOR[op.plan] || '#636e72'}99 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '0.88rem', fontFamily: FONT,
        }}>
          {initials(op.name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '0.97rem', color: C.black, fontFamily: FONT }}>{op.name || '—'}</span>
            {/* Plan badge */}
            <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: PLAN_BG[op.plan] || '#f0f0f0', color: PLAN_COLOR[op.plan] || C.textMuted, fontFamily: FONT }}>
              {t('plan_' + (op.plan || 'basic'))}
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: C.textMuted, marginTop: 2, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {op.email}
          </div>
        </div>

        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: active ? 'rgba(0,184,148,0.1)' : 'rgba(214,48,49,0.08)', borderRadius: 99, padding: '4px 10px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#00b894' : C.danger, flexShrink: 0 }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: active ? '#00b894' : C.danger, fontFamily: FONT }}>
            {active ? t('op_active') : t('op_inactive')}
          </span>
        </div>
      </div>

      {/* Lot info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--brand-soft)', borderRadius: R.sm, padding: '9px 13px' }}>
        <Icon name="pin" size={15} color="var(--brand)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--brand)', fontWeight: 600, fontFamily: FONT, opacity: 0.7 }}>{t('op_lot_label')}</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.text, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lotName}</div>
        </div>
        <div style={{ fontSize: '0.7rem', color: C.textMuted, fontFamily: FONT, flexShrink: 0 }}>
          {t('op_since')} {op.createdAt?.seconds ? new Date(op.createdAt.seconds * 1000).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '—'}
        </div>
      </div>

      {/* Notes */}
      {op.notes && (
        <div style={{ fontSize: '0.8rem', color: C.textSoft, fontFamily: FONT, fontStyle: 'italic', lineHeight: 1.5, padding: '0 2px' }}>
          "{op.notes}"
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <button
          onClick={onCopy}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 12px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
            background: 'var(--brand)', color: '#fff',
            fontWeight: 700, fontSize: '0.78rem', fontFamily: FONT,
            boxShadow: SHADOW.brand,
          }}
        >
          <Icon name="send" size={13} color="#fff" /> {t('op_copy_link')}
        </button>

        <button
          onClick={onToggle}
          style={{
            padding: '9px 14px', borderRadius: R.pill, border: `1.5px solid ${active ? C.greyMid : '#00b894'}`, cursor: 'pointer',
            background: C.white, color: active ? C.textMuted : '#00b894',
            fontWeight: 600, fontSize: '0.78rem', fontFamily: FONT,
          }}
        >
          {active ? t('op_deactivate') : t('op_activate')}
        </button>

        <button
          onClick={onDelete}
          style={{
            padding: '9px 11px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
            background: 'rgba(214,48,49,0.08)',
          }}
        >
          <Icon name="trash" size={15} color={C.danger} />
        </button>
      </div>
    </div>
  )
}
