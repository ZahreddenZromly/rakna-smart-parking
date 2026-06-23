import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { PARKING_LOTS, POINTS_PER_HOUR } from '../utils/constants'
import { ZONE_META } from '../utils/spotsData'
import { fmtHour, calcSplit, RAKNA_SHARE } from '../utils/pricing'
import { getLotName } from '../utils/constants'
import { QRCodeSVG } from 'qrcode.react'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'

// Stable booking-ID generation (not re-rolled on every render)
function useBookingId() {
  const [id] = useState(() => 'BK' + (1000 + Math.floor(Math.random() * 9000)))
  return id
}

export default function ReservationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, speak, lang } = useSettings()
  const [params] = useSearchParams()
  const lot = PARKING_LOTS.find((l) => l.id === id)
  const spotId  = params.get('spot')     || 'A1'
  const zoneKey = params.get('zone')     || 'regular'
  const zone    = ZONE_META[zoneKey]     || ZONE_META.regular
  const fromHour  = params.get('from')  ? Number(params.get('from'))     : null
  const toHour    = params.get('to')    ? Number(params.get('to'))       : null
  const duration  = params.get('duration') ? Number(params.get('duration')) : 1
  const total     = params.get('total')    ? Number(params.get('total'))    : (lot?.pricePerHour || 0)
  const isFullDay = params.get('fullDay')  === '1'

  const bookingId = useBookingId()
  const points    = POINTS_PER_HOUR * duration
  const split     = calcSplit(total, RAKNA_SHARE)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { speak(`${t('booking_confirmed')} ${t('spot')} ${spotId}`) }, [])

  if (!lot) return (
    <MobileLayout bottomNav={false}><p style={{ textAlign: 'center', marginTop: 60, color: C.textMuted }}>Lot not found.</p></MobileLayout>
  )

  const qrData = JSON.stringify({ bookingId, lot: lot.name, spot: spotId })

  const timeLabel = isFullDay
    ? t('full_day')
    : (fromHour != null ? `${fmtHour(fromHour)} – ${fmtHour(toHour)}` : `${duration}h`)

  return (
    <MobileLayout bottomNav={false} bg={C.grey}>
      {/* Success header */}
      <div style={{ textAlign: 'center', paddingTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Mascot size={120} mood="excited" /></div>
        <h2 style={{ margin: '8px 0 4px', fontSize: '1.4rem', fontWeight: 700, color: C.black }}>{t('booking_confirmed')}</h2>
        <p style={{ color: C.yellowDark, fontWeight: 600, fontSize: '0.85rem', margin: '0 0 6px' }}>{t('booking_thanks')}</p>
        <p style={{ color: C.textSoft, fontSize: '0.9rem', margin: 0 }}>
          {t('spot')} <strong>{spotId}</strong> · {getLotName(lot, lang)}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: C.yellowSoft, color: C.text, fontWeight: 700, fontSize: '0.82rem', padding: '7px 16px', borderRadius: R.pill }}>
          <Icon name="star" size={15} color={C.text} /> +{points} {t('points_earned')}
        </div>
      </div>

      {/* Ticket card */}
      <div className="anim-card" style={{ background: C.white, borderRadius: R.card, padding: 24, marginTop: 24, boxShadow: SHADOW.card, textAlign: 'center' }}>
        <div style={{ background: C.grey, borderRadius: R.md, padding: 18, display: 'inline-block' }}>
          <QRCodeSVG value={qrData} size={140} fgColor={C.black} />
        </div>

        {/* Booking details */}
        <div style={{ marginTop: 18, borderTop: '1.5px dashed ' + C.greyMid, paddingTop: 16, textAlign: 'left' }}>
          {[
            { label: t('booking_id'),   value: bookingId },
            { label: t('zone'),         value: t(zone.key) },
            { label: t('spot'),         value: spotId },
            { label: t('time_slot'),    value: timeLabel },
            { label: t('duration'),     value: `${duration} ${t('hours')}` },
            { label: t('rate'),         value: `${lot.pricePerHour} LYD/hr` },
          ].map((r) => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.88rem', borderBottom: '1px solid ' + C.grey }}>
              <span style={{ color: C.textMuted }}>{r.label}</span>
              <strong style={{ color: C.black }}>{r.value}</strong>
            </div>
          ))}
        </div>

        {/* Payment summary */}
        <div style={{ marginTop: 16, background: C.ink, borderRadius: R.md, padding: '14px 16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem' }}>{t('total_paid')}</span>
            <strong style={{ color: C.yellow, fontSize: '1.3rem' }}>{total} LYD</strong>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)' }}>
            <span>ركنة ({Math.round(RAKNA_SHARE * 100)}%)</span>
            <span>{split.rakna} LYD</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            <span>{t('owner_share')} ({Math.round((1 - RAKNA_SHARE) * 100)}%)</span>
            <span>{split.owner} LYD</span>
          </div>
        </div>
      </div>

      <button onClick={() => navigate('/my-reservations')} style={{
        marginTop: 20, width: '100%', padding: '17px', borderRadius: R.pill, border: 'none',
        background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: SHADOW.yellow,
      }}>
        {t('view_my_bookings')}
      </button>
      <button onClick={() => navigate('/map')} style={{
        marginTop: 12, marginBottom: 24, width: '100%', padding: '15px', borderRadius: R.pill,
        border: '1.5px solid ' + C.greyMid, background: C.white, color: C.black, fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer',
      }}>
        {t('back_home')}
      </button>
    </MobileLayout>
  )
}
