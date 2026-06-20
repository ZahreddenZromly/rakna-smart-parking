import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { ZONE_META } from '../../utils/spotsData'
import { createReservation } from '../../firebase/reservationService'
import { payFromWallet, addPoints } from '../../firebase/userService'
import RouteToSpot from './RouteToSpot'
import Icon from '../common/Icon'

export default function ConfirmBookingSheet({ spot, lot, onClose, onConfirm }) {
  const { t, speak, voice } = useSettings()
  const { user, profile, refresh } = useAuth()
  const navigate = useNavigate()
  const [showRoute, setShowRoute] = useState(true)
  const [method, setMethod] = useState('card')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (!spot) return null
  const zone = ZONE_META[spot.zone]
  const zoneLabel = t(zone.key)
  const total = lot.pricePerHour // 1-hour baseline charge for MVP
  const balance = profile?.walletBalance || 0

  const methods = [
    { k: 'card', icon: 'wallet', label: t('pay_card') },
    { k: 'transfer', icon: 'building', label: t('pay_transfer') },
    { k: 'wallet', icon: 'wallet', label: t('pay_wallet') + ` (${balance} LYD)` },
  ]

  const confirm = async () => {
    if (!user) { onClose(); navigate('/login'); return }
    setBusy(true); setErr('')
    try {
      if (method === 'wallet') await payFromWallet(user.uid, total, 'Parking ' + spot.id)
      await createReservation(user.uid, {
        lotId: lot.id, lotName: lot.name, spot: spot.id, zone: spot.zone,
        pricePerHour: lot.pricePerHour, total, paymentMethod: method,
      })
      await addPoints(user.uid, 20)
      await refresh(user.uid)
      onConfirm(spot)
    } catch (e) {
      setErr(e.message === 'insufficient' ? t('insufficient') : 'Payment failed, try again.')
      setBusy(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', animation: 'fadeIn 0.2s ease' }} />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 430,
        background: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '20px 22px calc(22px + env(safe-area-inset-bottom))',
        boxShadow: SHADOW.float, animation: 'sheetUp 0.3s ease', maxHeight: '90vh', overflowY: 'auto',
      }} className="no-scrollbar">
        <div style={{ width: 44, height: 5, borderRadius: 3, background: C.greyMid, margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: C.black }}>{t('confirm_booking')}</h3>
            <div style={{ color: C.textMuted, fontSize: '0.85rem', marginTop: 2 }}>{lot.name}</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: C.grey, cursor: 'pointer', fontSize: '1rem', color: C.textSoft }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <InfoCard icon={zone.iconName} label={t('parking_zone')} value={zoneLabel} />
          <InfoCard icon="pin" label={t('parking_place')} value={spot.id} />
        </div>

        {/* Route — shown prominently as a clear step */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 2px 10px' }}>
          <strong style={{ color: C.black, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="map" size={18} color={C.black} /> {t('your_route')}</strong>
          <button onClick={() => setShowRoute((s) => !s)} style={{
            background: 'none', border: 'none', color: C.textMuted, fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem',
          }}>
            {showRoute ? t('hide_route') : t('watch_route')}
          </button>
        </div>
        {showRoute && <RouteToSpot spot={spot} announce={voice} />}

        {/* payment methods */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.78rem', color: C.textMuted, marginBottom: 8 }}>{t('payment_method')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {methods.map((m) => {
              const active = method === m.k
              const disabled = m.k === 'wallet' && balance < total
              return (
                <button key={m.k} onClick={() => !disabled && setMethod(m.k)} disabled={disabled} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: R.md, cursor: disabled ? 'not-allowed' : 'pointer',
                  border: '1.5px solid ' + (active ? C.yellow : C.greyMid),
                  background: active ? C.yellowSoft : C.white, opacity: disabled ? 0.5 : 1, textAlign: 'left',
                }}>
                  <Icon name={m.icon} size={22} color={C.black} />
                  <span style={{ flex: 1, fontWeight: 600, color: C.black, fontSize: '0.88rem' }}>{m.label}</span>
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + (active ? C.black : C.greyMid),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{active && <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.black }} />}</span>
                </button>
              )
            })}
          </div>
        </div>

        {err && <div style={{ background: '#FFE5E3', color: C.danger, padding: '10px 14px', borderRadius: R.md, fontSize: '0.85rem', marginTop: 12 }}>{err}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black }}>{total} LYD</div>
            <div style={{ fontSize: '0.72rem', color: C.textMuted }}>{t('per_hour')}</div>
          </div>
          <button onClick={confirm} disabled={busy} style={{
            flex: 1, padding: '17px', borderRadius: R.pill, border: 'none',
            background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: busy ? 'wait' : 'pointer', boxShadow: SHADOW.yellow, opacity: busy ? 0.7 : 1,
          }}>
            {busy ? t('saving') : t('confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon, label, value }) {
  return (
    <div style={{ flex: 1, background: C.grey, borderRadius: R.md, padding: '14px 16px' }}>
      <Icon name={icon} size={22} color={C.black} />
      <div style={{ fontSize: '0.7rem', color: C.textMuted, marginTop: 6 }}>{label}</div>
      <div style={{ fontWeight: 700, color: C.black, fontSize: '0.95rem' }}>{value}</div>
    </div>
  )
}
