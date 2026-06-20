import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { PARKING_LOTS } from '../../utils/constants'
import { getLotOverrides, saveLot } from '../../firebase/adminService'

export default function AdminParkings() {
  const { t } = useSettings()
  const [lots, setLots] = useState(PARKING_LOTS.map((l) => ({ ...l })))
  const [savingId, setSavingId] = useState(null)
  const [savedId, setSavedId] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const ov = await getLotOverrides()
        setLots(PARKING_LOTS.map((l) => ({ ...l, ...(ov[l.id] || {}) })))
      } catch { /* ignore */ }
    })()
  }, [])

  const setField = (id, key, val) =>
    setLots((list) => list.map((l) => l.id === id ? { ...l, [key]: val } : l))

  const save = async (lot) => {
    setSavingId(lot.id)
    try {
      await saveLot(lot.id, {
        name: lot.name,
        availableSpots: Number(lot.availableSpots),
        totalSpots: Number(lot.totalSpots),
        pricePerHour: Number(lot.pricePerHour),
      })
      setSavedId(lot.id); setTimeout(() => setSavedId(null), 1500)
    } catch (e) { alert('Save failed: ' + e.message) }
    setSavingId(null)
  }

  return (
    <AdminLayout>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, margin: '8px 0 16px' }}>{t('a_parkings')}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {lots.map((lot) => {
          const pct = Math.round(((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100)
          return (
            <div key={lot.id} style={{ background: C.white, borderRadius: R.card, padding: 18, boxShadow: SHADOW.soft }}>
              <div style={{ fontWeight: 700, color: C.black }}>{lot.name}</div>
              <div style={{ color: C.textMuted, fontSize: '0.78rem', marginBottom: 12 }}>📍 {lot.address}</div>

              <div style={{ background: C.grey, borderRadius: R.sm, height: 8, marginBottom: 14 }}>
                <div style={{ width: pct + '%', height: '100%', borderRadius: R.sm, background: pct > 80 ? C.danger : pct > 50 ? C.reserved : C.available }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Num label={t('available_spots')} value={lot.availableSpots} onChange={(v) => setField(lot.id, 'availableSpots', v)} />
                <Num label="Total" value={lot.totalSpots} onChange={(v) => setField(lot.id, 'totalSpots', v)} />
                <Num label={t('price')} value={lot.pricePerHour} onChange={(v) => setField(lot.id, 'pricePerHour', v)} />
              </div>

              <button onClick={() => save(lot)} disabled={savingId === lot.id} style={{
                marginTop: 14, width: '100%', padding: '11px', borderRadius: R.pill, border: 'none',
                background: savedId === lot.id ? C.available : C.yellow, color: savedId === lot.id ? '#fff' : C.ink,
                fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}>
                {savingId === lot.id ? t('saving') : savedId === lot.id ? '✓ ' + t('save') : t('update')}
              </button>
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}

function Num({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', color: C.textMuted, marginBottom: 4 }}>{label}</div>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} style={{
        width: '100%', padding: '9px 8px', border: '1.5px solid ' + C.greyMid, borderRadius: R.sm,
        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: C.white, color: C.text, textAlign: 'center',
      }} />
    </div>
  )
}
