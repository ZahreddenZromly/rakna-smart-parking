import { useState } from 'react'
import MobileLayout from '../components/common/MobileLayout'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import MascotTip from '../components/common/MascotTip'

const REWARDS = [
  { id: 1, title: '1 Hour Free',       cost: 100, icon: 'logo'   },
  { id: 2, title: '5 LYD Off',         cost: 50,  icon: 'wallet' },
  { id: 3, title: 'VIP Spot',          cost: 200, icon: 'star'   },
  { id: 4, title: '20% Monthly Pass',  cost: 500, icon: 'shield' },
]
const HISTORY = [
  { id: 1, desc: 'Bourguiba Main Lot · 2h', pts: 20,   date: '15 Jun' },
  { id: 2, desc: 'Green Square · 1.5h',     pts: 15,   date: '14 Jun' },
  { id: 3, desc: 'Redeemed discount',       pts: -100, date: '12 Jun' },
  { id: 4, desc: 'Welcome bonus',           pts: 50,   date: '01 Jun' },
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
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: C.ink, color: C.onInk, padding: '10px 20px', borderRadius: R.pill, zIndex: 999, fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT }}>
          ✓ {toast}
        </div>
      )}

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: C.black, margin: '24px 0 18px', fontFamily: FONT }}>
        {t('rewards')}
      </h1>

      {/* Points card */}
      <div className="anim-card" style={{
        background: C.ink, borderRadius: R.card, padding: 24,
        color: C.onInk, boxShadow: SHADOW.card, position: 'relative', overflow: 'hidden',
        marginBottom: 16,
      }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'var(--brand)', opacity: 0.15, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT }}>
              <Icon name="star" size={16} color="rgba(255,255,255,0.6)" /> {t('your_points')}
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--brand)', lineHeight: 1.1, fontFamily: FONT }}>{points}</div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontFamily: FONT }}>{(points * 0.1).toFixed(1)} LYD {t('value')}</div>
          </div>
          {/* Progress ring placeholder */}
          <div style={{ textAlign: 'right', paddingTop: 4 }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: FONT, marginBottom: 8 }}>{ar => ar ? 'حتى الذهبي' : 'to Gold'}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,214,10,0.85)', fontFamily: FONT }}>{pct}%</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: R.pill, height: 8, marginTop: 16 }}>
          <div style={{ width: pct + '%', background: 'var(--brand)', borderRadius: R.pill, height: '100%', transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 6, fontFamily: FONT }}>{points}/500 {t('to_gold')}</div>
      </div>

      <MascotTip tips={['tip_rewards']} storageKey="rakna_tip_rewards" mood="party" />

      {/* Responsive split: rewards grid left, history right on desktop */}
      <div className="resp-row" style={{ marginTop: 4 }}>

        {/* Rewards grid */}
        <div className="resp-main">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '18px 0 12px', fontFamily: FONT }}>{t('redeem')}</h3>
          <div className="resp-2 stagger">
            {REWARDS.map((r) => {
              const ok = points >= r.cost
              return (
                <div key={r.id} className="press" style={{
                  background: C.white, borderRadius: R.card, padding: '18px 16px',
                  textAlign: 'center', boxShadow: SHADOW.soft, opacity: ok ? 1 : 0.55,
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: R.md, background: ok ? 'var(--brand-soft)' : C.grey, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Icon name={r.icon} size={24} color={ok ? 'var(--brand)' : C.textMuted} />
                  </div>
                  <div style={{ fontWeight: 700, color: C.black, fontSize: '0.9rem', fontFamily: FONT }}>{r.title}</div>
                  <div style={{ color: C.textMuted, fontWeight: 700, fontSize: '0.8rem', margin: '4px 0 12px', fontFamily: FONT }}>{r.cost} pts</div>
                  <button onClick={() => redeem(r)} disabled={!ok} className={ok ? 'press' : ''} style={{
                    width: '100%', padding: '10px', borderRadius: R.pill, border: 'none',
                    background: ok ? 'var(--brand)' : C.grey,
                    color: ok ? '#fff' : C.textMuted,
                    fontWeight: 700, fontSize: '0.82rem', fontFamily: FONT,
                    cursor: ok ? 'pointer' : 'not-allowed',
                  }}>{ok ? t('redeem') : t('locked')}</button>
                </div>
              )
            })}
          </div>
        </div>

        {/* History */}
        <div className="resp-aside">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '18px 0 12px', fontFamily: FONT }}>{t('history')}</h3>
          <div style={{ background: C.white, borderRadius: R.card, padding: '6px 18px', boxShadow: SHADOW.soft }}>
            {HISTORY.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < HISTORY.length - 1 ? '1px solid ' + C.grey : 'none' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', color: C.black, fontWeight: 500, fontFamily: FONT }}>{h.desc}</div>
                  <div style={{ fontSize: '0.72rem', color: C.textMuted, fontFamily: FONT }}>{h.date}</div>
                </div>
                <span style={{ fontWeight: 700, color: h.pts > 0 ? C.available : C.danger, fontFamily: FONT }}>
                  {h.pts > 0 ? '+' : ''}{h.pts}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </MobileLayout>
  )
}
