import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import Mascot from '../components/common/Mascot'
import QueuePanel from '../components/queue/QueuePanel'
import { PARKING_LOTS, getAvailabilityStatus } from '../utils/constants'

const STATUS_BG  = { available: C.available, limited: C.reserved, full: C.danger }
const STATUS_KEY = { available: 'available', limited: 'filling_up', full: 'full' }

export default function ParkingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, speak } = useSettings()
  const lot = PARKING_LOTS.find((l) => l.id === id)
  const isFull = lot && getAvailabilityStatus(lot.availableSpots, lot.totalSpots) === 'full'

  useEffect(() => { if (isFull) speak(t('lot_full_msg')) }, [isFull, speak, t])

  if (!lot) return (
    <MobileLayout bottomNav={false}>
      <TopBar title="—" />
      <p style={{ textAlign: 'center', color: C.textMuted, marginTop: 40 }}>الموقف غير موجود.</p>
    </MobileLayout>
  )

  const st  = getAvailabilityStatus(lot.availableSpots, lot.totalSpots)
  const pct = Math.round(((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100)

  return (
    <MobileLayout bottomNav={false}>
      <TopBar title={t('parking_details')} />

      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>

        {/* Hero card */}
        <div style={{
          background: 'var(--brand)', borderRadius: R.card,
          padding: 'clamp(18px,4vw,26px)',
          color: 'var(--on-ink)', boxShadow: SHADOW.card,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: 56, height: 56, borderRadius: R.md,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="building" size={28} color="#fff" />
            </div>
            <span style={{
              background: STATUS_BG[st] + '33', color: STATUS_BG[st],
              fontWeight: 700, fontSize: '0.72rem',
              padding: '6px 12px', borderRadius: R.pill, fontFamily: FONT,
            }}>
              {t(STATUS_KEY[st])}
            </span>
          </div>

          <h2 style={{ margin: '16px 0 4px', fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 700, fontFamily: FONT }}>
            {lot.name}
          </h2>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5, fontFamily: FONT }}>
            <Icon name="pin" size={14} color="rgba(255,255,255,0.65)" /> {lot.address}
          </div>

          {/* شريط الإشغال */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 6, fontFamily: FONT }}>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>{lot.availableSpots} {t('free_of')} {lot.totalSpots}</span>
              <span style={{ fontWeight: 700, color: '#60A5FA' }}>{pct}{t('pct_full')}</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: R.pill, height: 8 }}>
              <div style={{ width: pct + '%', background: '#60A5FA', borderRadius: R.pill, height: '100%', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>

        {/* ركنوش حزين لو ممتلئ */}
        {isFull && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginTop: 16,
            background: C.white, borderRadius: R.card, padding: '12px 14px',
            boxShadow: SHADOW.soft, border: '1.5px solid rgba(209,67,67,0.3)',
            animation: 'popIn 0.3s ease',
          }}>
            <div style={{ flexShrink: 0, width: 56 }}><Mascot size={56} mood="sad" /></div>
            <div style={{ fontSize: '0.86rem', color: C.black, lineHeight: 1.45, fontFamily: FONT }}>{t('lot_full_msg')}</div>
          </div>
        )}

        {/* طابور الانتظار */}
        {isFull && <QueuePanel lot={lot} />}

        {/* شبكة المعلومات */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginTop: 16,
        }}>
          {[
            { icon: 'wallet',   label: t('price'),    value: lot.pricePerHour + ' د.ل/س' },
            { icon: 'building', label: t('type'),     value: lot.type === 'Outdoor' ? 'مفتوح' : lot.type === 'Underground' ? 'مغطى' : lot.type },
            { icon: 'clock',    label: t('hours'),    value: lot.open24h ? t('open_24h') : t('daytime') },
            { icon: 'shield',   label: t('features'), value: lot.features.map(f => f === 'CCTV' ? 'كاميرات مراقبة' : f === 'Lighting' ? 'إضاءة' : f === 'Security' ? 'حراسة' : f === 'Covered' ? 'مسقوف' : f).join('، ') },
          ].map((it) => (
            <div key={it.label} style={{
              background: C.white, borderRadius: R.md,
              padding: 'clamp(12px,3vw,18px)', boxShadow: SHADOW.soft,
            }}>
              <Icon name={it.icon} size={22} color="var(--brand)" />
              <div style={{ fontSize: '0.7rem', color: C.textMuted, marginTop: 6, fontFamily: FONT }}>{it.label}</div>
              <div style={{ fontWeight: 700, color: C.black, fontSize: '0.85rem', fontFamily: FONT }}>{it.value}</div>
            </div>
          ))}
        </div>

        {/* زر خريطة الموقف */}
        <button
          onClick={() => navigate('/parking/' + lot.id + '/map')}
          style={{
            marginTop: 20, marginBottom: 24, width: '100%', padding: '17px',
            borderRadius: R.card, border: 'none', outline: 'none',
            background: 'var(--brand)', color: 'var(--on-ink)',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            boxShadow: SHADOW.brand, fontFamily: FONT,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {t('view_facility_map')} ←
        </button>
      </div>
    </MobileLayout>
  )
}