import { useState } from 'react'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'

const TYPES = ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Van', 'Motorcycle']
const COLORS = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey']

export default function MyVehiclesPage() {
  const { t } = useSettings()
  const [vehicles, setVehicles] = useState([
    { plate: '123 ABC', type: 'Sedan', color: 'White', primary: true },
    { plate: '456 DEF', type: 'SUV', color: 'Black', primary: false },
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ plate: '', type: 'Sedan', color: 'White' })

  const add = (e) => {
    e.preventDefault()
    setVehicles((v) => [...v, { ...form, primary: v.length === 0 }])
    setForm({ plate: '', type: 'Sedan', color: 'White' })
    setShowForm(false)
  }
  const remove = (p) => setVehicles((v) => v.filter((x) => x.plate !== p))
  const setPrimary = (p) => setVehicles((v) => v.map((x) => ({ ...x, primary: x.plate === p })))

  const field = { width: '100%', padding: '13px 16px', border: '1.5px solid ' + C.greyMid, borderRadius: R.md, fontSize: '1rem', boxSizing: 'border-box', outline: 'none', background: C.white, color: C.text }
  const label = { display: 'block', fontWeight: 600, marginBottom: 6, color: C.black, fontSize: '0.85rem' }

  return (
    <MobileLayout bottomNav={false} bg={C.grey}>
      <TopBar title={t('my_vehicles')} right={
        <button onClick={() => setShowForm((s) => !s)} aria-label={t('add_vehicle')} style={{ width: 46, height: 46, borderRadius: '50%', border: 'none', background: C.yellow, cursor: 'pointer', fontSize: '1.4rem', fontWeight: 700, boxShadow: SHADOW.soft, color: C.ink }}>
          {showForm ? '×' : '+'}
        </button>
      } />

      {showForm && (
        <form onSubmit={add} style={{ background: C.white, borderRadius: R.card, padding: 20, marginBottom: 16, boxShadow: SHADOW.soft }}>
          <div style={{ marginBottom: 14 }}>
            <label style={label}>{t('license_plate')}</label>
            <input style={{ ...field, fontFamily: 'monospace', letterSpacing: 2 }} required value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value.toUpperCase() })} placeholder="123 ABC" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div><label style={label}>{t('vehicle_type')}</label><select style={field} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label style={label}>{t('color')}</label><select style={field} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>{COLORS.map((x) => <option key={x}>{x}</option>)}</select></div>
          </div>
          <button type="submit" style={{ width: '100%', padding: '15px', borderRadius: R.pill, border: 'none', background: C.yellow, color: C.ink, fontWeight: 700, cursor: 'pointer', boxShadow: SHADOW.yellow }}>{t('save_vehicle')}</button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {vehicles.map((v) => (
          <div key={v.plate} style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft, border: v.primary ? '2px solid ' + C.yellow : '2px solid transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: R.md, background: C.yellowSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="car" size={26} color={C.ink} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ color: C.black, fontSize: '1.05rem', letterSpacing: 1 }}>{v.plate}</strong>
                  {v.primary && <span style={{ background: C.yellow, color: C.ink, fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: R.pill }}>{t('primary')}</span>}
                </div>
                <div style={{ color: C.textMuted, fontSize: '0.82rem' }}>{v.color} {v.type}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {!v.primary && <button onClick={() => setPrimary(v.plate)} style={{ flex: 1, padding: '10px', borderRadius: R.pill, border: 'none', background: C.grey, color: C.black, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>{t('set_primary')}</button>}
              <button onClick={() => remove(v.plate)} style={{ flex: 1, padding: '10px', borderRadius: R.pill, border: '1.5px solid ' + C.danger, background: C.white, color: C.danger, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>{t('remove')}</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: C.yellowSoft, borderRadius: R.md, padding: '14px 16px', marginTop: 16, marginBottom: 24, fontSize: '0.84rem', color: C.textSoft }}>
{t('vehicles_tip')}
      </div>
    </MobileLayout>
  )
}
