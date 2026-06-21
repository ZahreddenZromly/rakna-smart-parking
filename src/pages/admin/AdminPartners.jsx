import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Icon from '../../components/common/Icon'
import { subscribeLeads, setLeadStatus, removeLead, LEAD_STATUSES } from '../../firebase/partnerService'

const STATUS_COLOR = { new: '#0984E3', contacted: '#F2C200', qualified: '#A55EEA', won: '#26DE81', lost: '#d63031' }
const ts = (v) => (v?.seconds ? new Date(v.seconds * 1000).toLocaleDateString() : '—')

export default function AdminPartners() {
  const { t } = useSettings()
  const [leads, setLeads] = useState([])

  useEffect(() => subscribeLeads(setLeads), [])

  const counts = useMemo(() => {
    const c = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]))
    leads.forEach((l) => { if (c[l.status] != null) c[l.status]++ })
    return c
  }, [leads])

  const sorted = useMemo(
    () => [...leads].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)),
    [leads],
  )

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: '8px 0 18px' }}>{t('partners_dashboard')}</h1>

      {/* Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
        {LEAD_STATUSES.map((s) => (
          <div key={s} style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft, borderLeft: '5px solid ' + STATUS_COLOR[s] }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: C.black }}>{counts[s]}</div>
            <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>{t('p_' + s)}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.black, margin: '26px 0 12px' }}>{t('partners_pipeline')}</h2>

      {sorted.length === 0 ? (
        <div style={{ background: C.white, borderRadius: R.card, padding: 28, boxShadow: SHADOW.soft, textAlign: 'center', color: C.textMuted }}>{t('partners_empty')}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {sorted.map((l) => (
            <div key={l.id} style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: C.black, fontSize: '0.95rem' }}>{l.businessName || '—'}</div>
                  <div style={{ fontSize: '0.76rem', color: C.textMuted }}>{t('seg_' + (l.businessType || 'other'))} · {l.city || '—'} · {l.spaces || 0} {t('partners_spaces')}</div>
                </div>
                <span style={{ flexShrink: 0, background: STATUS_COLOR[l.status] + '22', color: STATUS_COLOR[l.status], fontWeight: 700, fontSize: '0.66rem', padding: '3px 9px', borderRadius: R.pill }}>{t('p_' + l.status)}</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: C.textSoft, margin: '8px 0', lineHeight: 1.5 }}>
                <div>{l.contactName}{l.readiness === 'ready' ? ' · ' + t('f_ready_yes') : ' · ' + t('f_ready_no')}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', color: C.textMuted }}>
                  {l.email && <span>{l.email}</span>}
                  {l.phone && <span>{l.phone}</span>}
                </div>
                {l.message && <div style={{ marginTop: 4, fontStyle: 'italic', color: C.textMuted }}>“{l.message}”</div>}
                {l.estMonthly ? <div style={{ marginTop: 4, color: C.yellowDark, fontWeight: 700 }}>~{Number(l.estMonthly).toLocaleString()} LYD/mo</div> : null}
                <div style={{ marginTop: 4, fontSize: '0.7rem', color: C.textMuted }}>{ts(l.createdAt)}</div>
              </div>

              {/* status pipeline buttons */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {LEAD_STATUSES.map((s) => (
                  <button key={s} onClick={() => setLeadStatus(l.id, s)} style={{
                    padding: '5px 10px', borderRadius: R.pill, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700,
                    border: '1.5px solid ' + (l.status === s ? STATUS_COLOR[s] : C.greyMid),
                    background: l.status === s ? STATUS_COLOR[s] + '18' : C.white,
                    color: l.status === s ? STATUS_COLOR[s] : C.textSoft,
                  }}>{t('p_' + s)}</button>
                ))}
                <button onClick={() => removeLead(l.id)} title={t('delete')} style={{
                  marginInlineStart: 'auto', padding: '5px 9px', borderRadius: 8, cursor: 'pointer',
                  border: 'none', background: C.danger + '18', color: C.danger,
                }}><Icon name="trash" size={14} color={C.danger} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
