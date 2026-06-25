import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Icon from '../../components/common/Icon'
import { subscribeLeads, setLeadStatus, removeLead, LEAD_STATUSES } from '../../firebase/partnerService'

const STATUS_COLOR = { new: '#0984E3', contacted: '#C98A1C', qualified: '#A55EEA', won: '#2F8F5B', lost: '#D14343' }
const ts = (v) => v?.seconds ? new Date(v.seconds * 1000).toLocaleDateString('ar-LY') : '—'

export default function AdminPartners() {
  const { t } = useSettings()
  const [leads, setLeads] = useState([])
  useEffect(() => subscribeLeads(setLeads), [])

  const counts = useMemo(() => {
    const c = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0]))
    leads.forEach((l) => { if (c[l.status] != null) c[l.status]++ })
    return c
  }, [leads])

  const sorted = useMemo(() =>
    [...leads].sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0)), [leads])

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: '8px 0 18px', fontFamily: FONT }}>{t('partners_dashboard')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 12 }}>
        {LEAD_STATUSES.map((s) => (
          <div key={s} style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft, borderLeft: '5px solid ' + STATUS_COLOR[s] }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: C.black, fontFamily: FONT }}>{counts[s]}</div>
            <div style={{ color: C.textMuted, fontSize: '0.82rem', fontFamily: FONT }}>{t('p_' + s)}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, borderRadius: R.card, padding: '12px 16px', boxShadow: SHADOW.soft, marginTop: 14 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: C.black, marginBottom: 8, fontFamily: FONT }}>{t('status_legend')}</div>
        {LEAD_STATUSES.map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '4px 0' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: STATUS_COLOR[s], flexShrink: 0, alignSelf: 'center' }} />
            <strong style={{ fontSize: '0.78rem', color: STATUS_COLOR[s], minWidth: 72, fontFamily: FONT }}>{t('p_' + s)}</strong>
            <span style={{ fontSize: '0.76rem', color: C.textMuted, fontFamily: FONT }}>{t('p_' + s + '_d')}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.black, margin: '26px 0 12px', fontFamily: FONT }}>{t('partners_pipeline')}</h2>

      {sorted.length === 0 ? (
        <div style={{ background: C.white, borderRadius: R.card, padding: 28, boxShadow: SHADOW.soft, textAlign: 'center', color: C.textMuted, fontFamily: FONT }}>{t('partners_empty')}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 14 }}>
          {sorted.map((l) => (
            <div key={l.id} style={{ background: C.white, borderRadius: R.card, padding: 16, boxShadow: SHADOW.soft }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: C.black, fontSize: '0.95rem', fontFamily: FONT }}>{l.businessName || '—'}</div>
                  <div style={{ fontSize: '0.76rem', color: C.textMuted, fontFamily: FONT }}>{t('seg_' + (l.businessType||'other'))} · {l.city||'—'} · {l.spaces||0} {t('partners_spaces')}</div>
                </div>
                <span style={{ flexShrink: 0, background: STATUS_COLOR[l.status] + '22', color: STATUS_COLOR[l.status], fontWeight: 700, fontSize: '0.66rem', padding: '3px 9px', borderRadius: R.pill, fontFamily: FONT }}>{t('p_' + l.status)}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: C.textSoft, margin: '8px 0', lineHeight: 1.5, fontFamily: FONT }}>
                <div>{l.contactName}{l.readiness === 'ready' ? ' · ' + t('f_ready_yes') : ' · ' + t('f_ready_no')}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', color: C.textMuted }}>
                  {l.email && <span>{l.email}</span>}
                  {l.phone && <span>{l.phone}</span>}
                </div>
                {l.planInterest && <div style={{ marginTop: 4 }}>{t('lead_plan')}: <strong style={{ color: C.black }}>{t('tier_' + l.planInterest)}</strong></div>}
                {l.message && <div style={{ marginTop: 4, fontStyle: 'italic', color: C.textMuted }}>"{l.message}"</div>}
                {l.estMonthly ? <div style={{ marginTop: 4, color: 'var(--brand)', fontWeight: 700 }}>~{Number(l.estMonthly).toLocaleString()} د.ل/شهر</div> : null}
                <div style={{ marginTop: 4, fontSize: '0.7rem', color: C.textMuted }}>{ts(l.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {LEAD_STATUSES.map((s) => (
                  <button key={s} onClick={() => setLeadStatus(l.id, s)} style={{
                    padding: '5px 10px', borderRadius: R.pill, cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, outline: 'none',
                    border: '1.5px solid ' + (l.status === s ? STATUS_COLOR[s] : C.greyMid),
                    background: l.status === s ? STATUS_COLOR[s] + '18' : C.white,
                    color: l.status === s ? STATUS_COLOR[s] : C.textSoft, fontFamily: FONT,
                  }}>{t('p_' + s)}</button>
                ))}
                <button onClick={() => removeLead(l.id)} style={{
                  marginInlineStart: 'auto', padding: '5px 9px', borderRadius: 8, cursor: 'pointer', outline: 'none',
                  border: 'none', background: 'rgba(209,67,67,0.1)', color: 'var(--error)',
                }}><Icon name="trash" size={14} color="var(--error)" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}