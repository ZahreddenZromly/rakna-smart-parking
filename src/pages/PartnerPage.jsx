import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'
import { submitLead } from '../firebase/partnerService'

const SEGMENTS = [
  { key: 'mall', icon: 'building' }, { key: 'hospital', icon: 'shield' },
  { key: 'university', icon: 'star' }, { key: 'cafe', icon: 'chat' },
  { key: 'residence', icon: 'building' }, { key: 'resort', icon: 'sun' },
  { key: 'public', icon: 'pin' }, { key: 'other', icon: 'sparkle' },
]
const BENEFITS = [
  { icon: 'wallet', tk: 'ben1_t', dk: 'ben1_d' },
  { icon: 'settings', tk: 'ben2_t', dk: 'ben2_d' },
  { icon: 'check', tk: 'ben3_t', dk: 'ben3_d' },
  { icon: 'star', tk: 'ben4_t', dk: 'ben4_d' },
]
const STEPS = [
  { icon: 'edit', tk: 'pstep1_title', dk: 'pstep1_desc' },
  { icon: 'map', tk: 'pstep2_title', dk: 'pstep2_desc' },
  { icon: 'sparkle', tk: 'pstep3_title', dk: 'pstep3_desc' },
]
// price = monthly LYD; commission = % of revenue; custom = quote (revenue share)
const TIERS = [
  { key: 'starter', price: '0', monthly: 0, commission: 0.15, tag: 'tier_starter_tag', feats: ['tier_starter_1', 'tier_starter_2', 'tier_starter_3'] },
  { key: 'pro', price: '149', monthly: 149, commission: 0.08, tag: 'tier_pro_tag', feats: ['tier_pro_1', 'tier_pro_2', 'tier_pro_3'], popular: true },
  { key: 'ent', price: null, monthly: null, commission: 0.25, tag: 'tier_ent_tag', feats: ['tier_ent_1', 'tier_ent_2', 'tier_ent_3'], custom: true },
]
const lyd = (n) => Math.round(n).toLocaleString()

export default function PartnerPage() {
  const navigate = useNavigate()
  const { t, speak } = useSettings()

  const [form, setForm] = useState({
    businessType: 'mall', businessName: '', contactName: '', email: '', phone: '', city: '',
    spaces: 80, readiness: 'needs_design', message: '',
  })
  const [price, setPrice] = useState(2)
  const [occ, setOcc] = useState(55)
  const [plan, setPlan] = useState('pro')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const tier = TIERS.find((x) => x.key === plan) || TIERS[1]

  // ---- ROI estimator: revenue + what the owner KEEPS after Rakna's fee ----
  const calc = useMemo(() => {
    const current = form.spaces * price * (occ / 100) * 12 * 30
    const gross = form.spaces * price * Math.min(0.95, (occ / 100) * 1.2) * 12 * 30
    const fee = tier.custom ? gross * tier.commission : (tier.monthly || 0) + gross * (tier.commission || 0)
    const keep = gross - fee
    return { current, gross, fee, keep, vsToday: keep - current }
  }, [form.spaces, price, occ, tier])

  const submit = async () => {
    if (!form.businessName.trim() || !form.contactName.trim() || (!form.email.trim() && !form.phone.trim())) {
      setErr(t('f_required')); return
    }
    setErr(''); setBusy(true)
    try {
      await submitLead({ ...form, spaces: Number(form.spaces) || 0, planInterest: plan, estMonthly: Math.round(calc.keep) })
      setDone(true)
      speak(t('partner_thanks_title'))
    } catch {
      setErr(t('f_required'))
    } finally { setBusy(false) }
  }

  if (done) {
    return (
      <MobileLayout bottomNav={false} bg={C.grey}>
        <TopBar title={t('partner_for_business')} />
        <div style={{ textAlign: 'center', padding: '36px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Mascot size={140} mood="happy" /></div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.black, margin: '12px 0 8px' }}>{t('partner_thanks_title')}</h1>
          <p style={{ color: C.textSoft, fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 320, margin: '0 auto 24px' }}>{t('partner_thanks_sub')}</p>
          <button onClick={() => { setDone(false); setForm((f) => ({ ...f, businessName: '', contactName: '', email: '', phone: '', city: '', message: '' })) }} style={ghostBtn}>{t('partner_another')}</button>
          <button onClick={() => navigate('/map')} style={{ ...primaryBtn, marginTop: 12 }}>{t('partner_back')}</button>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout bottomNav={false} bg={C.grey}>
      <TopBar title={t('partner_for_business')} />

      {/* Hero */}
      <div style={{ background: C.ink, borderRadius: R.card, padding: 22, color: C.onInk, boxShadow: SHADOW.card, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, insetInlineEnd: -20, width: 120, height: 120, borderRadius: '50%', background: C.yellow, opacity: 0.18 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ flexShrink: 0 }}><Mascot size={72} mood="wave" /></div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.25 }}>{t('partner_title')}</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6, margin: '14px 0 0' }}>{t('partner_sub')}</p>
        <button onClick={scrollToForm} style={{ ...primaryBtn, marginTop: 16 }}>{t('partner_cta_apply')} →</button>
      </div>

      {/* How you benefit */}
      <Section title={t('ben_title')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {BENEFITS.map((b) => (
          <div key={b.tk} style={{ background: C.white, borderRadius: R.md, padding: 14, boxShadow: SHADOW.soft }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Icon name={b.icon} size={18} color={C.ink} />
            </div>
            <div style={{ fontWeight: 700, color: C.black, fontSize: '0.88rem' }}>{t(b.tk)}</div>
            <div style={{ color: C.textMuted, fontSize: '0.76rem', lineHeight: 1.45, marginTop: 2 }}>{t(b.dk)}</div>
          </div>
        ))}
      </div>

      {/* Who it's for */}
      <Section title={t('partner_who')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {SEGMENTS.map((s) => {
          const active = form.businessType === s.key
          return (
            <button key={s.key} onClick={() => set('businessType', s.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: R.md, cursor: 'pointer',
              background: active ? C.yellowSoft : C.white, border: '1.5px solid ' + (active ? C.yellow : C.greyMid),
              boxShadow: SHADOW.soft, textAlign: 'start',
            }}>
              <Icon name={s.icon} size={20} color={C.ink} />
              <span style={{ fontWeight: 600, color: C.black, fontSize: '0.84rem' }}>{t('seg_' + s.key)}</span>
            </button>
          )
        })}
      </div>

      {/* How it works */}
      <Section title={t('partner_how')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map((st, i) => (
          <div key={st.tk} style={{ display: 'flex', alignItems: 'center', gap: 14, background: C.white, borderRadius: R.md, padding: 14, boxShadow: SHADOW.soft }}>
            <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Icon name={st.icon} size={20} color={C.ink} />
              <span style={{ position: 'absolute', top: -6, insetInlineStart: -6, width: 20, height: 20, borderRadius: '50%', background: C.ink, color: C.onInk, fontSize: '0.66rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: C.black, fontSize: '0.92rem' }}>{t(st.tk)}</div>
              <div style={{ color: C.textMuted, fontSize: '0.8rem', lineHeight: 1.4 }}>{t(st.dk)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing plans (selectable, drives the estimator) */}
      <Section title={t('partner_plans')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TIERS.map((tr) => {
          const selected = plan === tr.key
          return (
            <button key={tr.key} onClick={() => setPlan(tr.key)} style={{
              textAlign: 'start', cursor: 'pointer', width: '100%',
              background: tr.popular ? C.ink : C.white, color: tr.popular ? C.onInk : C.black,
              borderRadius: R.card, padding: 18, boxShadow: SHADOW.card,
              border: '2px solid ' + (selected ? C.yellow : (tr.popular ? C.ink : C.greyMid)), position: 'relative',
            }}>
              {tr.popular && (
                <span style={{ position: 'absolute', top: -10, insetInlineEnd: 16, background: C.yellow, color: C.ink, fontSize: '0.66rem', fontWeight: 800, padding: '3px 10px', borderRadius: R.pill }}>{t('tier_popular')}</span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{t('tier_' + tr.key)}</div>
                <div style={{ textAlign: 'end' }}>
                  {tr.custom ? (
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: tr.popular ? C.yellow : C.ink }}>{t('tier_price_custom')}</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: tr.popular ? C.yellow : C.ink }}>{tr.price}</span>
                      <span style={{ fontSize: '0.72rem', color: tr.popular ? 'rgba(255,255,255,0.6)' : C.textMuted }}> LYD{t('tier_price_mo')}</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '0.76rem', color: tr.popular ? C.yellow : C.textMuted, fontWeight: 600, marginBottom: 4 }}>{t(tr.tag)}</div>
              {/* cost line: commission / share */}
              <div style={{ fontSize: '0.78rem', color: tr.popular ? 'rgba(255,255,255,0.8)' : C.textSoft, marginBottom: 10 }}>
                {tr.custom ? t('tier_rev_share') : `${Math.round(tr.commission * 100)}% ${t('tier_per_booking')} · ${t('tier_no_setup')}`}
              </div>
              {tr.feats.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: '0.82rem' }}>
                  <Icon name="check" size={15} color={tr.popular ? C.yellow : C.available} />
                  <span style={{ color: tr.popular ? 'rgba(255,255,255,0.85)' : C.textSoft }}>{t(f)}</span>
                </div>
              ))}
              {tr.custom && <div style={{ fontSize: '0.72rem', color: C.textMuted, marginTop: 8, lineHeight: 1.4 }}>{t('tier_ent_invest')}</div>}
              <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: selected ? (tr.popular ? C.yellow : C.yellowDark) : C.textMuted }}>
                <Icon name={selected ? 'check' : 'plus'} size={14} color={selected ? (tr.popular ? C.yellow : C.yellowDark) : C.textMuted} />
                {selected ? t('tier_selected') : t('tier_select')}
              </div>
            </button>
          )
        })}
      </div>

      {/* ROI estimator with net profit after our fee */}
      <Section title={t('est_title')} />
      <div style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft }}>
        <div style={{ fontSize: '0.74rem', color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>{t('est_plan')}: <strong style={{ color: C.black }}>{t('tier_' + plan)}</strong></div>
        <Slider label={t('est_spaces')} value={form.spaces} min={10} max={1000} step={10} onChange={(v) => set('spaces', v)} suffix="" />
        <Slider label={t('est_price')} value={price} min={0.5} max={10} step={0.5} onChange={setPrice} suffix=" LYD" />
        <Slider label={t('est_occ')} value={occ} min={10} max={95} step={5} onChange={setOcc} suffix="%" />

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Metric label={t('est_current')} value={lyd(calc.current)} muted />
          <Metric label={t('est_gross')} value={lyd(calc.gross)} />
        </div>

        {tier.custom ? (
          <p style={{ fontSize: '0.78rem', color: C.textSoft, margin: '12px 0 0', lineHeight: 1.5, background: C.yellowSoft, padding: '10px 14px', borderRadius: R.md }}>{t('est_custom_note')}</p>
        ) : (
          <>
            <div style={{ marginTop: 12, background: C.grey, borderRadius: R.md, padding: '12px 14px' }}>
              <NetRow label={`${t('est_fee')} (${Math.round(tier.commission * 100)}%${tier.monthly ? ` + ${tier.monthly} LYD` : ''})`} value={`- ${lyd(calc.fee)} LYD`} color={C.textSoft} />
              <div style={{ height: 1, background: C.greyMid, margin: '8px 0' }} />
              <NetRow label={t('est_keep')} value={`${lyd(calc.keep)} LYD`} bold />
              <NetRow label={t('est_vs_today')} value={`${calc.vsToday >= 0 ? '+' : ''}${lyd(calc.vsToday)} LYD`} color={calc.vsToday >= 0 ? C.available : C.danger} bold />
            </div>
            <p style={{ fontSize: '0.7rem', color: C.textMuted, margin: '10px 0 0', lineHeight: 1.4 }}>{t('est_net_note')}</p>
          </>
        )}
      </div>

      {/* Lead form */}
      <div id="partner-form" />
      <Section title={t('form_title')} />
      <div style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft, marginBottom: 24 }}>
        <Field label={t('f_business')}><input value={form.businessName} onChange={(e) => set('businessName', e.target.value)} style={inp} /></Field>
        <Field label={t('f_contact')}><input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} style={inp} /></Field>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label={t('f_email')} flex><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} style={inp} /></Field>
          <Field label={t('f_phone')} flex><input value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inp} /></Field>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Field label={t('f_city')} flex><input value={form.city} onChange={(e) => set('city', e.target.value)} style={inp} /></Field>
          <Field label={t('f_spaces')} flex><input type="number" value={form.spaces} onChange={(e) => set('spaces', e.target.value)} style={inp} /></Field>
        </div>
        <Field label={t('f_ready')}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ k: 'ready', l: t('f_ready_yes') }, { k: 'needs_design', l: t('f_ready_no') }].map((o) => (
              <button key={o.k} onClick={() => set('readiness', o.k)} style={{
                flex: 1, padding: '11px', borderRadius: R.md, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                border: '1.5px solid ' + (form.readiness === o.k ? C.yellow : C.greyMid),
                background: form.readiness === o.k ? C.yellowSoft : C.white, color: C.black,
              }}>{o.l}</button>
            ))}
          </div>
        </Field>
        <Field label={t('f_message')}><textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} /></Field>
        {err && <p style={{ color: C.danger, fontSize: '0.8rem', margin: '0 0 10px' }}>{err}</p>}
        <button onClick={submit} disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.7 : 1 }}>
          <Icon name="send" size={18} color={C.ink} /> {busy ? t('saving') : t('f_submit')}
        </button>
      </div>
    </MobileLayout>
  )
}

function scrollToForm() {
  document.getElementById('partner-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ---- presentational helpers ----
function Section({ title }) {
  return <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: C.black, margin: '24px 0 12px' }}>{title}</h2>
}
function Field({ label, children, flex }) {
  return (
    <div style={{ marginBottom: 12, flex: flex ? 1 : undefined, minWidth: 0 }}>
      <label style={{ display: 'block', fontSize: '0.74rem', color: C.textMuted, fontWeight: 600, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}
function Metric({ label, value, muted }) {
  return (
    <div style={{ flex: 1, background: C.grey, borderRadius: R.md, padding: '12px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: muted ? C.textSoft : C.black, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.64rem', color: C.textMuted, marginTop: 3 }}>{label} · LYD</div>
    </div>
  )
}
function NetRow({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
      <span style={{ fontSize: '0.82rem', color: C.textSoft, fontWeight: bold ? 700 : 500 }}>{label}</span>
      <strong style={{ fontSize: bold ? '0.95rem' : '0.85rem', color: color || C.black, fontWeight: bold ? 800 : 600 }}>{value}</strong>
    </div>
  )
}
function Slider({ label, value, min, max, step, onChange, suffix }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.8rem', color: C.textSoft, fontWeight: 600 }}>{label}</span>
        <strong style={{ fontSize: '0.85rem', color: C.black }}>{value}{suffix}</strong>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: C.yellow }} />
    </div>
  )
}
const inp = {
  width: '100%', padding: '12px 14px', borderRadius: R.md, border: '1.5px solid ' + C.greyMid,
  outline: 'none', fontSize: '0.92rem', background: C.white, color: C.text, boxSizing: 'border-box',
}
const primaryBtn = {
  width: '100%', padding: '15px', borderRadius: R.pill, border: 'none', cursor: 'pointer',
  background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '0.98rem', boxShadow: SHADOW.yellow,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
}
const ghostBtn = {
  width: '100%', padding: '13px', borderRadius: R.pill, cursor: 'pointer',
  border: '1.5px solid ' + C.greyMid, background: C.white, color: C.textSoft, fontWeight: 600, fontSize: '0.9rem',
}
