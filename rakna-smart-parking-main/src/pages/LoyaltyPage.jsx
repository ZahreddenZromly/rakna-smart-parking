import { useState } from 'react'
import MobileLayout from '../components/common/MobileLayout'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'
import MascotTip from '../components/common/MascotTip'

const REWARDS = [
  { id: 1, titleKey: 'tip_1',     cost: 100, icon: 'logo',   titleAr: 'ساعة مجانية',      titleEn: '1 Hour Free' },
  { id: 2, titleKey: 'tip_2',     cost: 50,  icon: 'wallet', titleAr: 'خصم 5 د.ل',         titleEn: '5 LYD Off' },
  { id: 3, titleKey: 'tip_3',     cost: 200, icon: 'star',   titleAr: 'موقف VIP',           titleEn: 'VIP Spot' },
  { id: 4, titleKey: 'tip_4',     cost: 500, icon: 'shield', titleAr: 'تصريح شهري 20٪',    titleEn: '20% Monthly Pass' },
]

const HISTORY_AR = [
  { id: 1, desc: 'موقف بورقيبة · ساعتان',  pts: 20,   date: '15 يون' },
  { id: 2, desc: 'الميدان الأخضر · 1.5 س', pts: 15,   date: '14 يون' },
  { id: 3, desc: 'استبدال خصم',              pts: -100, date: '12 يون' },
  { id: 4, desc: 'مكافأة الترحيب',           pts: 50,   date: '01 يون' },
]
const HISTORY_EN = [
  { id: 1, desc: 'Bourguiba Lot · 2h',   pts: 20,   date: '15 Jun' },
  { id: 2, desc: 'Green Square · 1.5h',  pts: 15,   date: '14 Jun' },
  { id: 3, desc: 'Redeemed discount',     pts: -100, date: '12 Jun' },
  { id: 4, desc: 'Welcome bonus',         pts: 50,   date: '01 Jun' },
]

export default function LoyaltyPage() {
  const { t, speak, lang } = useSettings()
  const [points, setPoints] = useState(230)
  const [toast,  setToast]  = useState(null)
  const isAr = lang === 'ar'
  const HISTORY = isAr ? HISTORY_AR : HISTORY_EN

  const redeem = (r) => {
    if (points < r.cost) return
    const title = isAr ? r.titleAr : r.titleEn
    setPoints((p) => p - r.cost)
    setToast(t('redeemed') + ': ' + title)
    speak(`${t('redeemed')} ${title}`)
    setTimeout(() => setToast(null), 2500)
  }
  const pct = Math.min(100, Math.round((points / 500) * 100))

  return (
    <MobileLayout>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--brand)', color: 'var(--on-ink)',
          padding: '10px 20px', borderRadius: R.pill,
          zIndex: 300, fontSize: '0.85rem', fontWeight: 600,
          boxShadow: SHADOW.float, whiteSpace: 'nowrap', fontFamily: FONT,
        }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ maxWidth: 720, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.3rem,4vw,1.6rem)', fontWeight: 700, color: C.black, margin: '24px 0 18px', fontFamily: FONT }}>
          {t('rewards')}
        </h1>

        {/* بطاقة النقاط */}
        <div className="anim-card" style={{
          background: 'var(--brand)', borderRadius: R.card,
          padding: 'clamp(18px,4vw,28px)',
          color: 'var(--on-ink)', boxShadow: SHADOW.card,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -30,
            width: 140, height: 140, borderRadius: '50%',
            background: 'var(--accent)', opacity: 0.15,
          }} />
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT }}>
            <Icon name="star" size={16} color="rgba(255,255,255,0.6)" /> {t('your_points')}
          </div>
          <div style={{ fontSize: 'clamp(2.4rem,8vw,3.2rem)', fontWeight: 800, color: '#60A5FA', lineHeight: 1.1, fontFamily: FONT }}>
            {points}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: 16, fontFamily: FONT }}>
            {(points * 0.1).toFixed(1)} {isAr ? 'د.ل' : 'LYD'} {t('value')}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: R.pill, height: 8 }}>
            <div style={{ width: pct + '%', background: '#60A5FA', borderRadius: R.pill, height: '100%', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 6, fontFamily: FONT }}>
            {points}/500 {t('to_gold')}
          </div>
        </div>

        <MascotTip tips={['tip_rewards']} storageKey="rakna_tip_rewards" />

        {/* شبكة المكافآت */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '22px 0 12px', fontFamily: FONT }}>
          {t('redeem')}
        </h3>
        <div className="stagger" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}>
          {REWARDS.map((r) => {
            const ok    = points >= r.cost
            const title = isAr ? r.titleAr : r.titleEn
            return (
              <div key={r.id} style={{
                background: C.white, borderRadius: R.card,
                padding: 'clamp(12px,3vw,18px)',
                textAlign: 'center', boxShadow: SHADOW.soft,
                opacity: ok ? 1 : 0.55,
              }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Icon name={r.icon} size={30} color="var(--brand)" />
                </div>
                <div style={{ fontWeight: 700, color: C.black, fontSize: '0.88rem', marginTop: 6, fontFamily: FONT }}>{title}</div>
                <div style={{ color: C.textMuted, fontWeight: 700, fontSize: '0.78rem', margin: '4px 0 10px', fontFamily: FONT }}>
                  {r.cost} {isAr ? 'نقطة' : 'pts'}
                </div>
                <button onClick={() => redeem(r)} disabled={!ok} style={{
                  width: '100%', padding: '9px', borderRadius: R.pill,
                  border: 'none', outline: 'none',
                  background: ok ? 'var(--brand)' : C.grey,
                  color: ok ? 'var(--on-ink)' : C.textMuted,
                  fontWeight: 700, fontSize: '0.8rem',
                  cursor: ok ? 'pointer' : 'not-allowed',
                  fontFamily: FONT,
                }}>
                  {ok ? t('redeem') : t('locked')}
                </button>
              </div>
            )
          })}
        </div>

        {/* السجل */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '22px 0 12px', fontFamily: FONT }}>
          {t('history')}
        </h3>
        <div style={{ background: C.white, borderRadius: R.card, padding: '6px 18px', boxShadow: SHADOW.soft, marginBottom: 24 }}>
          {HISTORY.map((h, i) => (
            <div key={h.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0',
              borderBottom: i < HISTORY.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
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
    </MobileLayout>
  )
}