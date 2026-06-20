import { QRCodeSVG } from 'qrcode.react'

export default function QRTicket({ reservation }) {
  const qrData = JSON.stringify({
    id: reservation.id,
    lot: reservation.lotName,
    plate: reservation.plate,
    from: reservation.from,
    to: reservation.to,
  })

  const handlePrint = () => window.print()

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '2rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '340px', margin: '0 auto',
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>
        🅿 Parking Ticket
      </div>
      <div style={{ color: '#636e72', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Show this QR code at the parking entrance
      </div>

      <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.5rem', display: 'inline-block', marginBottom: '1.5rem' }}>
        <QRCodeSVG value={qrData} size={160} fgColor="#1a1a2e" />
      </div>

      <div style={{ borderTop: '1px dashed #e0e0e0', paddingTop: '1rem', textAlign: 'left' }}>
        {[
          { label: 'Booking ID', value: reservation.id },
          { label: 'Location', value: reservation.lotName },
          { label: 'Plate', value: reservation.plate },
          { label: 'From', value: reservation.from },
          { label: 'To', value: reservation.to },
          { label: 'Total', value: `${reservation.total} LYD` },
        ].map((row) => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: '#b2bec3' }}>{row.label}</span>
            <strong style={{ color: '#1a1a2e' }}>{row.value}</strong>
          </div>
        ))}
      </div>

      <button onClick={handlePrint} style={{
        marginTop: '1.2rem', width: '100%', padding: '10px',
        background: '#1a1a2e', color: '#fff', border: 'none',
        borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
      }}>
        🖨 Print Ticket
      </button>
    </div>
  )
}
