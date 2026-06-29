import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../styles/theme'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { saveProfile } from '../firebase/userService'
import Icon from '../components/common/Icon'

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useSettings()
  const [saving, setSaving]   = useState(false)
  const [done,   setDone]     = useState(false)
  const [form,   setForm]     = useState({ name: '', gender: '', plate: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const persist = async () => {
    if (!user) { navigate('/map'); return }
    setSaving(true)
    try {
      await saveProfile(user.uid, { name: form.name, gender: form.gender, plate: form.plate })
    } catch { /* ignore — still advance */ }
    setSaving(false)
    setDone(true)
  }

  const fieldStyle = {
    width: '100%', padding: '14px 16px',
    border: '1.5px solid ' + C.greyMid, borderRadius: R.md,
    fontSize: '1rem', boxSizing: 'border-box', outline: 'none',
    background: C.grey, color: C.text, fontFamily: FONT, marginBottom: 16,
  }
  const labelStyle = {
    display: 'block', fontWeight: 600, marginBottom: 8,
    color: C.black, fontSize: '0.85rem', fontFamily: FONT,
  }
  const primaryBtn = {
    width: '100%', padding: '16px', borderRadius: R.pill,
    border: 'none', background: C.yellow, color: C.ink,
    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    boxShadow: SHADOW.yellow, fontFamily: FONT,
  }

  // ── Done state ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="auth-wide">
        <div className="auth-wide-card" style={{ padding: '0 28px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 86, height: 86, borderRadius: '50%', background: C.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: SHADOW.yellow }}>
            <Icon name="check" size={44} color={C.ink} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.black, margin: '0 0 8px', fontFamily: FONT, textAlign: 'center' }}>
            {t('profile_complete')}
          </h2>
          {form.name && (
            <p style={{ color: C.textMuted, fontSize: '0.92rem', margin: '0 0 32px', fontFamily: FONT, textAlign: 'center' }}>
              {form.name}{form.plate ? ' · ' + form.plate : ''}
            </p>
          )}
          <button onClick={() => navigate('/map')} style={primaryBtn}>
            {t('find_parking_now')}
          </button>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="auth-wide">
      <div className="auth-wide-card" style={{ padding: '0 28px 40px' }}>

        <div style={{ textAlign: 'center', paddingTop: 52, marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <Icon name="logo" size={48} color={C.black} strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: '0 0 6px', fontFamily: FONT }}>
            {t('setup_title')}
          </h1>
          <p style={{ color: C.textMuted, fontSize: '0.88rem', margin: 0, fontFamily: FONT }}>
            {t('setup_sub')}
          </p>
        </div>

        {/* Full name */}
        <label style={labelStyle}>{t('full_name')}</label>
        <input
          style={fieldStyle}
          type="text"
          autoFocus
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Ahmed Al-Mansouri"
        />

        {/* Gender */}
        <label style={labelStyle}>{t('gender')}</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {['male', 'female'].map(g => (
            <button
              key={g}
              type="button"
              onClick={() => set('gender', g)}
              style={{
                flex: 1, padding: '14px', borderRadius: R.md,
                border: '2px solid ' + (form.gender === g ? C.yellow : C.greyMid),
                background: form.gender === g ? C.yellow : C.white,
                color: form.gender === g ? C.ink : C.textSoft,
                fontWeight: 700, cursor: 'pointer',
                fontSize: '0.95rem', fontFamily: FONT,
                transition: 'all 0.15s',
              }}
            >
              {g === 'male' ? t('male') : t('female')}
            </button>
          ))}
        </div>

        {/* Plate */}
        <label style={labelStyle}>{t('license_plate')}</label>
        <input
          style={{ ...fieldStyle, fontFamily: 'monospace', letterSpacing: 3, textTransform: 'uppercase' }}
          type="text"
          value={form.plate}
          onChange={e => set('plate', e.target.value.toUpperCase())}
          placeholder="123 ABC"
        />

        <button
          onClick={() => form.name && persist()}
          disabled={saving || !form.name}
          style={{ ...primaryBtn, marginTop: 8, opacity: (saving || !form.name) ? 0.55 : 1 }}
        >
          {saving ? t('saving') : t('save_profile')}
        </button>

        <button
          onClick={() => navigate('/map')}
          style={{ width: '100%', padding: '13px', marginTop: 10, background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '0.9rem', fontFamily: FONT }}
        >
          {t('skip_now')}
        </button>
      </div>
    </div>
  )
}
