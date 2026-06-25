import { useState } from 'react'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'

const TYPES  = ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Van', 'Motorcycle']
const COLORS = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey']

// يلغي الـ outline البرتقالي من المتصفح
const btn = (extra = {}) => ({
  outline: 'none',
  fontFamily: FONT,
  cursor: 'pointer',
  ...extra,
})

export default function MyVehiclesPage() {
  const { t } = useSettings()
  const [vehicles, setVehicles] = useState([
    { plate: '123 ABC', type: 'Sedan', color: 'White', primary: true  },
    { plate: '456 DEF', type: 'SUV',   color: 'Black', primary: false },
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ plate: '', type: 'Sedan', color: 'White' })

  const add = (e) => {
    e.preventDefault()
    setVehicles((v) => [...v, { ...form, primary: v.length === 0 }])
    setForm({ plate: '', type: 'Sedan', color: 'White' })
    setShowForm(false)
  }
  const remove     = (p) => setVehicles((v) => v.filter((x) => x.plate !== p))
  const setPrimary = (p) => setVehicles((v) => v.map((x) => ({ ...x, primary: x.plate === p })))

  const fieldStyle = {
    width: '100%', padding: '13px 16px',
    border: '1.5px solid var(--border)',
    borderRadius: R.md, fontSize: '1rem',
    boxSizing: 'border-box', outline: 'none',
    background: 'var(--input-bg)', color: C.black,
    fontFamily: FONT,
  }
  const labelStyle = {
    display: 'block', fontWeight: 600,
    marginBottom: 6, color: C.black,
    fontSize: '0.85rem', fontFamily: FONT,
  }

  return (
    <MobileLayout bottomNav={false}>
      <TopBar title={t('my_vehicles')} right={
        <button
          onClick={() => setShowForm((s) => !s)}
          aria-label={t('add_vehicle')}
          style={btn({
            width: 46, height: 46, borderRadius: '50%',
            border: 'none', background: 'var(--brand)',
            fontSize: '1.4rem', fontWeight: 700,
            boxShadow: SHADOW.soft, color: 'var(--on-ink)',
          })}
        >
          {showForm ? '×' : '+'}
        </button>
      } />

      {/* فورم الإضافة */}
      {showForm && (
        <div style={{
          background: C.white, borderRadius: R.card,
          padding: 'clamp(16px,4vw,24px)',
          marginBottom: 16, boxShadow: SHADOW.soft,
          maxWidth: 600,
        }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{t('license_plate')}</label>
            <input
              style={{ ...fieldStyle, fontFamily: 'monospace', letterSpacing: 2 }}
              required value={form.plate}
              onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })}
              placeholder="123 ABC"
            />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12, marginBottom: 16,
          }}>
            <div>
              <label style={labelStyle}>{t('vehicle_type')}</label>
              <select style={fieldStyle} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t('color')}</label>
              <select style={fieldStyle} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                {COLORS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={add}
            style={btn({
              width: '100%', padding: '15px',
              borderRadius: R.pill, border: 'none',
              background: 'var(--brand)', color: 'var(--on-ink)',
              fontWeight: 700, fontSize: '0.95rem',
              boxShadow: SHADOW.brand,
            })}
          >
            {t('save_vehicle')}
          </button>
        </div>
      )}

      {/* قائمة السيارات */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 14,
        maxWidth: 900,
      }}>
        {vehicles.map((v) => (
          <div key={v.plate} style={{
            background: C.white, borderRadius: R.card,
            padding: 'clamp(14px,3vw,20px)',
            boxShadow: SHADOW.soft,
            border: v.primary ? '2px solid var(--brand)' : '2px solid transparent',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 50, height: 50, borderRadius: R.md, flexShrink: 0,
                background: 'var(--brand-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="car" size={24} color="var(--brand)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ color: C.black, fontSize: '1rem', letterSpacing: 1, fontFamily: 'monospace' }}>
                    {v.plate}
                  </strong>
                  {v.primary && (
                    <span style={{
                      background: 'var(--brand)', color: 'var(--on-ink)',
                      fontSize: '0.62rem', fontWeight: 700,
                      padding: '2px 8px', borderRadius: R.pill, fontFamily: FONT,
                    }}>
                      {t('primary')}
                    </span>
                  )}
                </div>
                <div style={{ color: C.textMuted, fontSize: '0.82rem', marginTop: 2, fontFamily: FONT }}>
                  {v.color} · {v.type}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {!v.primary && (
                <button onClick={() => setPrimary(v.plate)} style={btn({
                  flex: 1, padding: '10px', borderRadius: R.pill,
                  border: '1.5px solid var(--border)',
                  background: C.white, color: C.black,
                  fontWeight: 600, fontSize: '0.82rem',
                })}>
                  {t('set_primary')}
                </button>
              )}
              <button onClick={() => remove(v.plate)} style={btn({
                flex: 1, padding: '10px', borderRadius: R.pill,
                border: '1.5px solid var(--error)',
                background: C.white, color: 'var(--error)',
                fontWeight: 600, fontSize: '0.82rem',
              })}>
                {t('remove')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* نصيحة */}
      <div style={{
        background: 'var(--brand-soft)',
        borderRadius: R.md,
        padding: '14px 16px',
        marginTop: 16, marginBottom: 24,
        fontSize: '0.84rem', color: 'var(--text-soft)',
        fontFamily: FONT,
        border: '1px solid var(--border)',
        maxWidth: 900,
      }}>
        {t('vehicles_tip')}
      </div>
    </MobileLayout>
  )
}