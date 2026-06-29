import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { saveProfile } from '../firebase/userService'
import Icon from '../components/common/Icon'

const STEPS = 3
const CAR_TYPES = ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Van', 'Motorcycle']
const CAR_COLORS = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey', 'Green', 'Yellow']

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { user, refresh } = useAuth()
  const { t } = useSettings()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ fullName: '', phone: '', nationalId: '', plate: '', carType: 'Sedan', carColor: 'White', carModel: '' })
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
    } catch { /* ignore; still advance */ }
    setSaving(false)
    setStep(2)
  }

  const field = { width: '100%', padding: '14px 16px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '1rem', boxSizing: 'border-box', outline: 'none', background: C.grey, color: C.text }
  const label = { display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.85rem' }
  const primary = { width: '100%', padding: '16px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: SHADOW.yellow }

  return (
    <div className="auth-wide">
      <div className="auth-wide-card" style={{ padding: '0 28px 28px' }}>
        <div style={{ textAlign: 'center', paddingTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="logo" size={46} color={C.black} strokeWidth={1.8} /></div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, margin: '10px 0 4px' }}>{t('setup_title')}</h1>
          <p style={{ color: C.textMuted, fontSize: '0.85rem', margin: 0 }}>{t('setup_sub')}</p>
        </div>

        {/* steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '28px 0' }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', background: i <= step ? C.yellow : C.grey, color: i <= step ? C.ink : C.textMuted }}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS - 1 && <div style={{ width: 36, height: 2, background: i < step ? C.yellow : C.greyMid }} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <h3 style={{ color: C.black, margin: '0 0 16px' }}>{t('personal_info')}</h3>
            {[
              { k: 'fullName', label: t('full_name'), ph: 'Ahmed Al-Mansouri', type: 'text' },
              { k: 'phone', label: t('phone'), ph: '0912345678', type: 'tel' },
              { k: 'nationalId', label: t('national_id_opt'), ph: '—', type: 'text' },
            ].map((f) => (
              <div key={f.k} style={{ marginBottom: 14 }}>
                <label style={label}>{f.label}</label>
                <input style={field} type={f.type} value={form[f.k]} onChange={(e) => set(f.k, e.target.value)} placeholder={f.ph} />
              </div>
            ))}
            <button onClick={() => form.fullName && form.phone && setStep(1)} style={{ ...primary, marginTop: 10 }}>{t('next_vehicle')}</button>
            <button onClick={() => navigate('/map')} style={{ width: '100%', padding: 12, background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', marginTop: 8 }}>{t('skip_now')}</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 style={{ color: C.black, margin: '0 0 16px' }}>{t('your_vehicle')}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={label}>{t('license_plate')}</label>
              <input style={{ ...field, fontFamily: 'monospace', letterSpacing: 2 }} value={form.plate} onChange={(e) => set('plate', e.target.value.toUpperCase())} placeholder="123 ABC" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div><label style={label}>{t('vehicle_type')}</label><select style={field} value={form.carType} onChange={(e) => set('carType', e.target.value)}>{CAR_TYPES.map((ct) => <option key={ct}>{ct}</option>)}</select></div>
              <div><label style={label}>{t('color')}</label><select style={field} value={form.carColor} onChange={(e) => set('carColor', e.target.value)}>{CAR_COLORS.map((cc) => <option key={cc}>{cc}</option>)}</select></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={label}>{t('car_model_opt')}</label>
              <input style={field} value={form.carModel} onChange={(e) => set('carModel', e.target.value)} placeholder="Toyota Camry 2020" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(0)} style={{ flex: 1, padding: 14, borderRadius: R.pill, border: 'none', background: C.grey, color: C.black, fontWeight: 600, cursor: 'pointer' }}>{t('back')}</button>
              <button onClick={() => form.plate && persist()} disabled={saving} style={{ ...primary, flex: 2, opacity: saving ? 0.7 : 1 }}>{saving ? t('saving') : t('save_profile')}</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: C.yellow, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={40} color={C.ink} strokeWidth={2.5} /></div>
            <h3 style={{ color: C.black, margin: '8px 0 6px' }}>{t('profile_complete')}</h3>
            <p style={{ color: C.textSoft, fontSize: '0.92rem', marginBottom: 18 }}><strong>{form.fullName}</strong> · <strong>{form.plate}</strong></p>
            <div style={{ background: C.grey, borderRadius: R.card, padding: 18, textAlign: 'left', marginBottom: 20 }}>
              {[
                { l: t('full_name'), v: form.fullName },
                { l: t('phone'), v: form.phone },
                { l: t('license_plate'), v: form.plate },
                { l: t('vehicle_type'), v: form.carColor + ' ' + form.carType },
              ].map((r) => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.88rem', borderBottom: '1px solid ' + C.greyMid }}>
                  <span style={{ color: C.textMuted }}>{r.l}</span><strong style={{ color: C.black }}>{r.v}</strong>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/map')} style={primary}>{t('find_parking_now')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
