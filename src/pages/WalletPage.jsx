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
  const [txns, setTxns] = useState([])
  const [amount, setAmount] = useState(25)
  const [method, setMethod] = useState('card')
  const [busy, setBusy] = useState(false)

  const loadTxns = async () => { if (user) setTxns(await getWalletTxns(user.uid)) }
  useEffect(() => { loadTxns() }, [user])

  if (!user) return (
    <MobileLayout bottomNav={false}>
      <TopBar title={t('wallet')} />
      <div style={{ textAlign: 'center', marginTop: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Icon name="wallet" size={48} color={C.black} strokeWidth={1.7} />
        </div>
        <p style={{ color: C.textMuted, fontFamily: FONT }}>{t('please_login')}</p>
        <button onClick={() => navigate('/login')} style={{ background: 'var(--brand)', border: 'none', padding: '12px 28px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: FONT }}>{t('sign_in')}</button>
      </div>
    </MobileLayout>
  )

  const topUp = async () => {
    setBusy(true)
    try {
      await topUpWallet(user.uid, amount, method)
      await refresh(user.uid)
      await loadTxns()
      speak(`${t('top_up')} ${amount} LYD`)
    } catch { /* ignore */ }
    setBusy(false)
  }

  return (
    <MobileLayout bottomNav={false} bg={C.grey}>
      <TopBar title={t('wallet')} />

      {/* Responsive split: balance+txns left, topup right on desktop */}
      <div className="resp-row">

        {/* LEFT / TOP: balance card + transactions */}
        <div className="resp-main" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Balance card */}
          <div className="anim-card" style={{
            background: C.ink, borderRadius: R.card, padding: 24,
            color: C.onInk, boxShadow: SHADOW.card, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'var(--brand)', opacity: 0.15, pointerEvents: 'none' }} />
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT }}>
              <Icon name="wallet" size={16} color="rgba(255,255,255,0.6)" /> {t('wallet_balance')}
            </div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--brand)', lineHeight: 1.2, fontFamily: FONT }}>
              {(profile?.walletBalance || 0).toFixed(0)}{' '}
              <span style={{ fontSize: '1.2rem', color: C.onInk }}>LYD</span>
            </div>
          </div>

          <MascotTip tips={['tip_wallet']} storageKey="rakna_tip_wallet" mood="cool" />

          {/* Transactions */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '0 0 12px', fontFamily: FONT }}>
              {t('transactions')}
            </h3>
            <div style={{ background: C.white, borderRadius: R.card, padding: '6px 18px', boxShadow: SHADOW.soft }}>
              {txns.length === 0 ? (
                <p style={{ color: C.textMuted, textAlign: 'center', padding: '20px 0', fontSize: '0.9rem', fontFamily: FONT }}>
                  {t('no_transactions')}
                </p>
              ) : txns.map((x, i) => (
                <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < txns.length - 1 ? '1px solid ' + C.grey : 'none' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: C.black, fontWeight: 500, fontFamily: FONT }}>{x.type === 'topup' ? t('top_up') : (x.note || 'Payment')}</div>
                    <div style={{ fontSize: '0.72rem', color: C.textMuted, fontFamily: FONT }}>{x.method || x.type}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: x.amount > 0 ? C.available : C.danger, fontFamily: FONT }}>
                    {x.amount > 0 ? '+' : ''}{x.amount} LYD
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM: top-up form */}
        <div className="resp-aside">
          <div className="anim-card" style={{ background: C.white, borderRadius: R.card, padding: 20, boxShadow: SHADOW.soft }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1rem', color: C.black, fontFamily: FONT }}>{t('add_money')}</h3>

            {/* Amount grid */}
            <div className="resp-4" style={{ marginBottom: 14, gap: 8 }}>
              {AMOUNTS.map((a) => (
                <button key={a} onClick={() => setAmount(a)} className="press" style={{
                  padding: '13px 0', borderRadius: R.md, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontFamily: FONT, fontSize: '0.92rem',
                  background: amount === a ? 'var(--brand)' : C.grey,
                  color: amount === a ? '#fff' : C.black,
                }}>{a}</button>
              ))}
            </div>

            {/* Method */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[{ k: 'card', l: t('pay_card') }, { k: 'transfer', l: t('pay_transfer') }].map((m) => (
                <button key={m.k} onClick={() => setMethod(m.k)} style={{
                  flex: 1, padding: '11px', borderRadius: R.md, cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600, fontFamily: FONT,
                  border: '1.5px solid ' + (method === m.k ? 'var(--brand)' : C.greyMid),
                  background: method === m.k ? 'var(--brand-soft)' : C.white, color: C.black,
                }}>{m.l}</button>
              ))}
            </div>

            <button onClick={topUp} disabled={busy} className="press" style={{
              width: '100%', padding: '15px', borderRadius: R.pill, border: 'none',
              background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-dark) 100%)',
              color: '#fff', fontWeight: 700, fontSize: '1rem', fontFamily: FONT,
              cursor: busy ? 'wait' : 'pointer', boxShadow: SHADOW.brand, opacity: busy ? 0.7 : 1,
            }}>{busy ? t('saving') : `${t('top_up')} ${amount} LYD`}</button>
          </div>
        </div>
      </div>

    </MobileLayout>
  )
}
