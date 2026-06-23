import { useState } from 'react'
import MobileLayout from '../components/common/MobileLayout'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import MascotTip from '../components/common/MascotTip'
import RaknoushGallery from '../components/common/RaknoushGallery'

const REWARDS = [
  { id: 1, title: '1 Hour Free', cost: 100, icon: 'logo' },
  { id: 2, title: '5 LYD Off', cost: 50, icon: 'wallet' },
  { id: 3, title: 'VIP Spot', cost: 200, icon: 'star' },
  { id: 4, title: '20% Monthly Pass', cost: 500, icon: 'shield' },
]
const HISTORY = [
  { id: 1, desc: 'Bourguiba Main Lot · 2h', pts: 20, date: '15 Jun' },
  { id: 2, desc: 'Green Square · 1.5h', pts: 15, date: '14 Jun' },
  { id: 3, desc: 'Redeemed discount', pts: -100, date: '12 Jun' },
  { id: 4, desc: 'Welcome bonus', pts: 50, date: '01 Jun' },
]

export default function LoyaltyPage() {
  const { t, speak } = useSettings()
  const [points, setPoints] = useState(230)
  const [toast, setToast] = useState(null)

  const redeem = (r) => {
    if (points < r.cost) return
    setPoints((p) => p - r.cost)
    setToast(t('redeemed') + ': ' + r.title)
    speak(`${t('redeemed')} ${r.title}`)
    setTimeout(() => setToast(null), 2500)
  }
  const pct = Math.min(100, Math.round((points / 500) * 100))

  return (
    <MobileLayout bg={C.grey}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: C.ink, color: C.onInk, padding: '10px 20px', borderRadius: R.pill, zIndex: 100, fontSize: '0.85rem', fontWeight: 600 }}>
          ✓ {toast}
        </div>
      )}

      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.black, margin: '24px 0 18px' }}>{t('rewards')}</h1>

      {/* Points card */}
      <div className="anim-card" style={{ background: C.ink, borderRadius: R.card, padding: 24, color: C.onInk, boxShadow: SHADOW.card, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: C.yellow, opacity: 0.15 }} />
        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="star" size={16} color="rgba(255,255,255,0.6)" /> {t('your_points')}</div>
        <div style={{ fontSize: '3rem', fontWeight: 800, color: C.yellow, lineHeight: 1.1 }}>{points}</div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{(points * 0.1).toFixed(1)} LYD {t('value')}</div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: R.pill, height: 8 }}>
          <div style={{ width: pct + '%', background: C.yellow, borderRadius: R.pill, height: '100%' }} />
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>{points}/500 {t('to_gold')}</div>
      </div>

      {/* Rukna tip */}
      <MascotTip tips={['tip_rewards']} storageKey="rakna_tip_rewards" mood="party" />

      {/* Meet Raknoush — full mood gallery */}
      <div style={{ marginTop: 18 }}>
        <RaknoushGallery />
      </div>

      {/* Rewards grid */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '22px 0 12px' }}>{t('redeem')}</h3>
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {REWARDS.map((r) => {
          const ok = points >= r.cost
          return (
            <div key={r.id} style={{ background: C.white, borderRadius: R.card, padding: 16, textAlign: 'center', boxShadow: SHADOW.soft, opacity: ok ? 1 : 0.55 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name={r.icon} size={30} color={C.black} /></div>
              <div style={{ fontWeight: 700, color: C.black, fontSize: '0.88rem', marginTop: 4 }}>{r.title}</div>
              <div style={{ color: C.textMuted, fontWeight: 700, fontSize: '0.8rem', margin: '4px 0 10px' }}>{r.cost} pts</div>
              <button onClick={() => redeem(r)} disabled={!ok} style={{
                width: '100%', padding: '9px', borderRadius: R.pill, border: 'none',
                background: ok ? C.yellow : C.grey, color: ok ? C.ink : C.textMuted,
                fontWeight: 700, fontSize: '0.8rem', cursor: ok ? 'pointer' : 'not-allowed',
              }}>{ok ? t('redeem') : t('locked')}</button>
            </div>
          )
        })}
      </div>

      {/* History */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '22px 0 12px' }}>{t('history')}</h3>
      <div style={{ background: C.white, borderRadius: R.card, padding: '6px 18px', boxShadow: SHADOW.soft }}>
        {HISTORY.map((h, i) => (
          <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < HISTORY.length - 1 ? '1px solid ' + C.grey : 'none' }}>
            <div>
              <div style={{ fontSize: '0.88rem', color: C.black, fontWeight: 500 }}>{h.desc}</div>
              <div style={{ fontSize: '0.72rem', color: C.textMuted }}>{h.date}</div>
            </div>
            <span style={{ fontWeight: 700, color: h.pts > 0 ? C.available : C.danger }}>{h.pts > 0 ? '+' : ''}{h.pts}</span>
          </div>
        ))}
      </div>
    </MobileLayout>
  )
}
