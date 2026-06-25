import { QRCodeSVG } from 'qrcode.react'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'

export default function QRTicket({ reservation }) {
  const { t } = useSettings()

  const qrData = JSON.stringify({
    id: reservation.id,
    lot: reservation.lotName,
    plate: reservation.plate,
    from: reservation.from,
    to: reservation.to,
  })

  const rows = [
    { label: t('booking_id'), value: reservation.id },
    { label: t('location'),   value: reservation.lotName },
    { label: t('license_plate'), value: reservation.plate },
    { label: t('time'),       value: reservation.from },
    { label: t('total'),      value: `${reservation.total} د.ل` },
  ]

  return (
    <div style={{
      background: C.white, borderRadius: R.card,
      padding: 'clamp(20px, 5vw, 32px)',
      boxShadow: SHADOW.card, textAlign: 'center',
      maxWidth: 340, margin: '0 auto',
      fontFamily: FONT,
    }}>
      {/* العنوان */}
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: C.black, marginBottom: 4 }}>
        🅿 {t('parking_details')}
      </div>
      <div style={{ color: C.textMuted, fontSize: '0.84rem', marginBottom: 20 }}>
        {t('route_hint')}
      </div>

      {/* QR */}
      <div style={{
        background: C.grey, borderRadius: R.md,
        padding: 20, display: 'inline-block', marginBottom: 20,
      }}>
        <QRCodeSVG value={qrData} size={160} fgColor={C.black} bgColor="transparent" />
      </div>

      {/* التفاصيل */}
      <div style={{
        borderTop: '1px dashed var(--border)',
        paddingTop: 14, textAlign: 'right',
      }}>
        {rows.map((row) => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between',
            marginBottom: 8, fontSize: '0.84rem', gap: 8,
          }}>
            <span style={{ color: C.textMuted }}>{row.label}</span>
            <strong style={{ color: C.black }}>{row.value}</strong>
          </div>
        ))}
      </div>

      {/* زر الطباعة */}
      <button
        onClick={() => window.print()}
        style={{
          marginTop: 16, width: '100%', padding: '11px',
          background: C.ink, color: C.onInk,
          border: 'none', borderRadius: R.md,
          cursor: 'pointer', fontWeight: 700,
          fontSize: '0.9rem', fontFamily: FONT,
        }}
      >
        🖨 {t('confirm')}
      </button>
    </div>
  )
}