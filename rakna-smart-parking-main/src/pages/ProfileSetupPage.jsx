import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { saveProfile } from '../firebase/userService'
import Icon from '../components/common/Icon'

const STEPS = 3
const CAR_TYPES  = ['Sedan','SUV','Truck','Hatchback','Van','Motorcycle']
const CAR_COLORS = ['White','Black','Silver','Red','Blue','Grey','Green','Yellow']

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { user, refresh } = useAuth()
  const { t } = useSettings()
  const [step,   setStep]   = useState(0)
  const [saving, setSaving] = useState(false)
  const [form,   setForm]   = useState({
    fullName: '', phone: '', nationalId: '',
    plate: '', carType: 'Sedan', carColor: 'White', carModel: '',
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const persist = async () => {
    if (!user) return setStep(2)
    setSaving(true)
    try {
      await saveProfile(user.uid, {
        name: form.fullName, phone: form.phone, nationalId: form.nationalId,
        plate: form.plate, carType: form.carType, carColor: form.carColor, carModel: form.carModel,
      })
      await refresh(user.uid)
    } catch {}
    setSaving(false)
    setStep(2)
  }

  const field = {
    width: '100%', padding: '14px 16px',
    border: '1.5px solid var(--border)',
    borderRadius: R.md, fontSize: '1rem',
    boxSizing: 'border-box', outline: 'none',
    background: 'var(--input-bg)', color: C.black,
    fontFamily: FONT,
  }
  const labelStyle = { display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.85rem', fontFamily: FONT }
  const primary = {
    width: '100%', padding: '16px', borderRadius: R.pill,
    border: 'none', outline: 'none',
    background: 'var(--brand)', color: 'var(--on-ink)',
    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    boxShadow: SHADOW.brand, fontFamily: FONT,
  }

  return (
    <>
      <style>{`
        .setup-root {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          justify-content: center;
          font-family: Tajawal, system-ui, sans-serif;
        }
        .setup-card {
          width: 100%;
          min-height: 100vh;
          background: var(--surface);
          padding: 0 clamp(20px,6vw,40px);
          box-shadow: 0 0 60px rgba(0,0,0,0.10);
        }
        @media (min-width: 768px) {
          .setup-root { align-items: center; padding: 40px; }
          .setup-card {
            min-height: unset;
            max-width: 520px;
            border-radius: 28px;
            padding: clamp(32px,5vw,52px);
            box-shadow: 0 16px 48px rgba(15,34,77,0.12);
          }
        }
      `}</style>

      <div className="setup-root">
        <div className="setup-card">
          {/* الهيدر */}
          <div style={{ textAlign: 'center', paddingTop: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Icon name="logo" size={46} color="var(--brand)" strokeWidth={1.8} />
            </div>
            <h1 style={{ fontSize: 'clamp(1.2rem,3vw,1.5rem)', fontWeight: 800, color: C.black, margin: '10px 0 4px', fontFamily: FONT }}>{t('setup_title')}</h1>
            <p style={{ color: C.textMuted, fontSize: '0.85rem', margin: 0, fontFamily: FONT }}>{t('setup_sub')}</p>
          </div>

          {/* مؤشر الخطوات */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '28px 0' }}>
            {Array.from({ length: STEPS }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', fontFamily: FONT,
                  background: i <= step ? 'var(--brand)' : C.grey,
                  color: i <= step ? 'var(--on-ink)' : C.textMuted,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS - 1 && (
                  <div style={{ width: 36, height: 2, background: i < step ? 'var(--brand)' : C.greyMid }} />
                )}
              </div>
            ))}
          </div>

          {/* الخطوة 1 — معلومات شخصية */}
          {step === 0 && (
            <div>
              <h3 style={{ color: C.black, margin: '0 0 16px', fontFamily: FONT }}>{t('personal_info')}</h3>
              {[
                { k: 'fullName',   label: t('full_name'),       ph: 'أحمد المنصوري', type: 'text' },
                { k: 'phone',      label: t('phone'),            ph: '0912345678',    type: 'tel' },
                { k: 'nationalId', label: t('national_id_opt'), ph: '—',             type: 'text' },
              ].map((f) => (
                <div key={f.k} style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>{f.label}</label>
                  <input style={field} type={f.type} value={form[f.k]} onChange={(e) => set(f.k, e.target.value)} placeholder={f.ph} />
                </div>
              ))}
              <button onClick={() => form.fullName && form.phone && setStep(1)} style={{ ...primary, marginTop: 10 }}>
                {t('next_vehicle')}
              </button>
              <button onClick={() => navigate('/map')} style={{ width: '100%', padding: 12, background: 'none', border: 'none', outline: 'none', color: C.textMuted, cursor: 'pointer', marginTop: 8, fontFamily: FONT }}>
                {t('skip_now')}
              </button>
            </div>
          )}

          {/* الخطوة 2 — بيانات السيارة */}
          {step === 1 && (
            <div>
              <h3 style={{ color: C.black, margin: '0 0 16px', fontFamily: FONT }}>{t('your_vehicle')}</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>{t('license_plate')}</label>
                <input style={{ ...field, fontFamily: 'monospace', letterSpacing: 2 }} value={form.plate} onChange={(e) => set('plate', e.target.value.toUpperCase())} placeholder="123 ABC" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>{t('vehicle_type')}</label>
                  <select style={field} value={form.carType} onChange={(e) => set('carType', e.target.value)}>
                    {CAR_TYPES.map((ct) => <option key={ct}>{ct}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('color')}</label>
                  <select style={field} value={form.carColor} onChange={(e) => set('carColor', e.target.value)}>
                    {CAR_COLORS.map((cc) => <option key={cc}>{cc}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>{t('car_model_opt')}</label>
                <input style={field} value={form.carModel} onChange={(e) => set('carModel', e.target.value)} placeholder="Toyota Camry 2020" />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(0)} style={{
                  flex: 1, padding: 14, borderRadius: R.pill,
                  border: 'none', outline: 'none',
                  background: C.grey, color: C.black,
                  fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
                }}>
                  {t('back')}
                </button>
                <button onClick={() => form.plate && persist()} disabled={saving} style={{ ...primary, flex: 2, opacity: saving ? 0.7 : 1 }}>
                  {saving ? t('saving') : t('save_profile')}
                </button>
              </div>
            </div>
          )}

          {/* الخطوة 3 — تأكيد */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'var(--brand)', margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="check" size={38} color="#fff" strokeWidth={2.5} />
              </div>
              <h3 style={{ color: C.black, margin: '12px 0 6px', fontFamily: FONT }}>{t('profile_complete')}</h3>
              <p style={{ color: C.textSoft, fontSize: '0.92rem', marginBottom: 18, fontFamily: FONT }}>
                <strong>{form.fullName}</strong> · <strong>{form.plate}</strong>
              </p>
              <div style={{ background: C.grey, borderRadius: R.card, padding: 18, textAlign: 'start', marginBottom: 20 }}>
                {[
                  { l: t('full_name'),    v: form.fullName },
                  { l: t('phone'),        v: form.phone },
                  { l: t('license_plate'),v: form.plate },
                  { l: t('vehicle_type'), v: form.carColor + ' ' + form.carType },
                ].map((r) => (
                  <div key={r.l} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '7px 0', fontSize: '0.88rem',
                    borderBottom: '1px solid var(--border)', fontFamily: FONT,
                  }}>
                    <span style={{ color: C.textMuted }}>{r.l}</span>
                    <strong style={{ color: C.black }}>{r.v}</strong>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/map')} style={primary}>
                {t('find_parking_now')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}