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
const STEPS = [
  { icon: 'edit', tk: 'pstep1_title', dk: 'pstep1_desc' },
  { icon: 'map', tk: 'pstep2_title', dk: 'pstep2_desc' },
  { icon: 'sparkle', tk: 'pstep3_title', dk: 'pstep3_desc' },
]
const TIERS = [
  { key: 'starter', tag: 'tier_starter_tag', feats: ['tier_starter_1', 'tier_starter_2', 'tier_starter_3'] },
  { key: 'pro', tag: 'tier_pro_tag', feats: ['tier_pro_1', 'tier_pro_2', 'tier_pro_3'], popular: true },
  { key: 'ent', tag: 'tier_ent_tag', feats: ['tier_ent_1', 'tier_ent_2', 'tier_ent_3'] },
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
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // ---- ROI estimator: spaces × price × occupancy × 12h × 30d ----
  const { current, withRakna, uplift } = useMemo(() => {
    const cur = form.spaces * price * (occ / 100) * 12 * 30
    const boosted = form.spaces * price * Math.min(0.95, (occ / 100) * 1.2) * 12 * 30
    return { current: cur, withRakna: boosted, uplift: Math.max(0, boosted - cur) }
  }, [form.spaces, price, occ])

  const submit = async () => {
    if (!form.businessName.trim() || !form.contactName.trim() || (!form.email.trim() && !form.phone.trim())) {
      setErr(t('f_required')); return
    }
    setErr(''); setBusy(true)
    try {
      await submitLead({ ...form, spaces: Number(form.spaces) || 0, estMonthly: Math.round(withRakna) })
      setDone(true)
      speak(t('partner_thanks_title'))
    } catch {
      setErr(t('f_required'))
    } finally { setBusy(false) }
  }

  // ---- success state ----
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
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, lineHeight: 1.25 }}>{t('partner_title')}</h1>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6, margin: '14px 0 0' }}>{t('partner_sub')}</p>
        <button onClick={() => scrollToForm()} style={{ ...primaryBtn, marginTop: 16 }}>{t('partner_cta_apply')} →</button>
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
            <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: C.ink, position: 'relative' }}>
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

      {/* ROI estimator */}
      <Section title={t('est_title')} />
      <div style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft }}>
        <Slider label={t('est_spaces')} value={form.spaces} min={10} max={1000} step={10} onChange={(v) => set('spaces', v)} suffix="" />
        <Slider label={t('est_price')} value={price} min={0.5} max={10} step={0.5} onChange={setPrice} suffix=" LYD" />
        <Slider label={t('est_occ')} value={occ} min={10} max={95} step={5} onChange={setOcc} suffix="%" />
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Metric label={t('est_current')} value={lyd(current)} muted />
          <Metric label={t('est_with')} value={lyd(withRakna)} />
        </div>
        <div style={{ marginTop: 10, background: C.yellowSoft, borderRadius: R.md, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: C.ink, fontWeight: 600 }}>{t('est_uplift')}</span>
          <strong style={{ color: C.yellowDark, fontWeight: 800 }}>+{lyd(uplift)} LYD</strong>
        </div>
        <p style={{ fontSize: '0.7rem', color: C.textMuted, margin: '10px 0 0', lineHeight: 1.4 }}>{t('est_note')}</p>
      </div>

      {/* Tiers */}
      <Section title={t('partner_plans')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TIERS.map((tier) => (
          <div key={tier.key} style={{
            background: tier.popular ? C.ink : C.white, color: tier.popular ? C.onInk : C.black,
            borderRadius: R.card, padding: 18, boxShadow: SHADOW.card,
            border: '1.5px solid ' + (tier.popular ? C.yellow : C.greyMid), position: 'relative',
          }}>
            {tier.popular && (
              <span style={{ position: 'absolute', top: -10, insetInlineEnd: 16, background: C.yellow, color: C.ink, fontSize: '0.66rem', fontWeight: 800, padding: '3px 10px', borderRadius: R.pill }}>{t('tier_popular')}</span>
            )}
            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{t('tier_' + tier.key)}</div>
            <div style={{ fontSize: '0.78rem', color: tier.popular ? C.yellow : C.textMuted, fontWeight: 600, marginBottom: 10 }}>{t(tier.tag)}</div>
            {tier.feats.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: '0.84rem' }}>
                <Icon name="check" size={16} color={tier.popular ? C.yellow : C.available} />
                <span style={{ color: tier.popular ? 'rgba(255,255,255,0.85)' : C.textSoft }}>{t(f)}</span>
              </div>
            ))}
          </div>
        ))}
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
