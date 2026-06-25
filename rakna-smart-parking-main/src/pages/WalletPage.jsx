import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW, FONT } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { topUpWallet, getWalletTxns } from '../firebase/userService'
import Icon from '../components/common/Icon'
import MascotTip from '../components/common/MascotTip'

const AMOUNTS = [10, 25, 50, 100]

export default function WalletPage() {
  const navigate = useNavigate()
  const { t, speak } = useSettings()
  const { user, profile, refresh } = useAuth()
  const [txns,   setTxns]   = useState([])
  const [amount, setAmount] = useState(25)
  const [method, setMethod] = useState('card')
  const [busy,   setBusy]   = useState(false)

  const loadTxns = async () => { if (user) setTxns(await getWalletTxns(user.uid)) }
  useEffect(() => { loadTxns() }, [user])

  if (!user) return (
    <MobileLayout bottomNav={false}>
      <TopBar title={t('wallet')} />
      <div style={{ textAlign: 'center', marginTop: 60, maxWidth: 400, margin: '60px auto 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Icon name="wallet" size={48} color="var(--brand)" strokeWidth={1.7} />
        </div>
        <p style={{ color: C.textMuted, fontFamily: FONT }}>{t('please_login')}</p>
        <button onClick={() => navigate('/login')} style={{
          background: 'var(--brand)', border: 'none', outline: 'none',
          padding: '12px 28px', borderRadius: R.pill,
          fontWeight: 700, cursor: 'pointer',
          color: 'var(--on-ink)', fontFamily: FONT,
        }}>
          {t('sign_in')}
        </button>
      </div>
    </MobileLayout>
  )

  const topUp = async () => {
    setBusy(true)
    try {
      await topUpWallet(user.uid, amount, method)
      await refresh(user.uid)
      await loadTxns()
      speak(`${t('top_up')} ${amount} د.ل`)
    } catch {}
    setBusy(false)
  }

  return (
    <MobileLayout bottomNav={false}>
      <TopBar title={t('wallet')} />

      <div style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>

        {/* بطاقة الرصيد */}
        <div className="anim-card" style={{
          background: 'var(--brand)', borderRadius: R.card,
          padding: 'clamp(18px,4vw,28px)',
          color: 'var(--on-ink)', boxShadow: SHADOW.card,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT }}>
            <Icon name="wallet" size={16} color="rgba(255,255,255,0.65)" /> {t('wallet_balance')}
          </div>
          <div style={{ fontSize: 'clamp(2.2rem,6vw,2.8rem)', fontWeight: 800, color: '#60A5FA', lineHeight: 1.2, fontFamily: FONT }}>
            {(profile?.walletBalance || 0).toFixed(0)}{' '}
            <span style={{ fontSize: '1.1rem', color: 'var(--on-ink)', fontFamily: FONT }}>د.ل</span>
          </div>
        </div>

        <MascotTip tips={['tip_wallet']} storageKey="rakna_tip_wallet" />

        {/* شحن الرصيد */}
        <div style={{ background: C.white, borderRadius: R.card, padding: 'clamp(14px,3vw,20px)', marginTop: 16, boxShadow: SHADOW.soft }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: C.black, fontFamily: FONT }}>{t('add_money')}</h3>

          {/* أزرار المبالغ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8, marginBottom: 14,
          }}>
            {AMOUNTS.map((a) => (
              <button key={a} onClick={() => setAmount(a)} style={{
                padding: '12px 0', borderRadius: R.md,
                border: 'none', outline: 'none', cursor: 'pointer',
                fontWeight: 700, fontFamily: FONT,
                background: amount === a ? 'var(--brand)' : C.grey,
                color: amount === a ? 'var(--on-ink)' : C.black,
              }}>
                {a}
              </button>
            ))}
          </div>

          {/* طريقة الدفع */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[{ k: 'card', l: t('pay_card') }, { k: 'transfer', l: t('pay_transfer') }].map((m) => (
              <button key={m.k} onClick={() => setMethod(m.k)} style={{
                flex: 1, padding: '11px', borderRadius: R.md,
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                border: '1.5px solid ' + (method === m.k ? 'var(--brand)' : C.greyMid),
                background: method === m.k ? 'var(--brand-soft)' : C.white,
                color: C.black, outline: 'none', fontFamily: FONT,
              }}>
                {m.l}
              </button>
            ))}
          </div>

          <button onClick={topUp} disabled={busy} style={{
            width: '100%', padding: '15px', borderRadius: R.pill,
            border: 'none', outline: 'none',
            background: 'var(--brand)', color: 'var(--on-ink)',
            fontWeight: 700, fontSize: '1rem',
            cursor: busy ? 'wait' : 'pointer',
            boxShadow: SHADOW.brand, opacity: busy ? 0.7 : 1,
            fontFamily: FONT,
          }}>
            {busy ? t('saving') : `${t('top_up')} ${amount} د.ل`}
          </button>
        </div>

        {/* المعاملات */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '22px 0 12px', fontFamily: FONT }}>
          {t('transactions')}
        </h3>
        <div style={{ background: C.white, borderRadius: R.card, padding: '6px 18px', boxShadow: SHADOW.soft, marginBottom: 24 }}>
          {txns.length === 0 ? (
            <p style={{ color: C.textMuted, textAlign: 'center', padding: '20px 0', fontSize: '0.9rem', fontFamily: FONT }}>
              {t('no_transactions')}
            </p>
          ) : txns.map((x, i) => (
            <div key={x.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0',
              borderBottom: i < txns.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: C.black, fontWeight: 500, fontFamily: FONT }}>
                  {x.type === 'topup' ? t('top_up') : (x.note || t('payment'))}
                </div>
                <div style={{ fontSize: '0.72rem', color: C.textMuted, fontFamily: FONT }}>
                  {x.method === 'card' ? t('pay_card') : x.method === 'transfer' ? t('pay_transfer') : x.type}
                </div>
              </div>
              <span style={{ fontWeight: 700, color: x.amount > 0 ? C.available : C.danger, fontFamily: FONT }}>
                {x.amount > 0 ? '+' : ''}{x.amount} د.ل
              </span>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  )
}