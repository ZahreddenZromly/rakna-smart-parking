import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW } from '../styles/theme'
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
        <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="wallet" size={48} color={C.black} strokeWidth={1.7} /></div>
        <p style={{ color: C.textMuted }}>{t('please_login')}</p>
        <button onClick={() => navigate('/login')} style={{ background: C.yellow, border: 'none', padding: '12px 24px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', color: C.ink }}>{t('sign_in')}</button>
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

      {/* Balance card */}
      <div className="anim-card" style={{ background: C.ink, borderRadius: R.card, padding: 24, color: C.onInk, boxShadow: SHADOW.card, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '50%', background: C.yellow, opacity: 0.15 }} />
        <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="wallet" size={16} color="rgba(255,255,255,0.6)" /> {t('wallet_balance')}</div>
        <div style={{ fontSize: '2.8rem', fontWeight: 800, color: C.yellow, lineHeight: 1.2 }}>{(profile?.walletBalance || 0).toFixed(0)} <span style={{ fontSize: '1.2rem', color: C.onInk }}>LYD</span></div>
      </div>

      {/* Rukna tip */}
      <MascotTip tips={['tip_wallet']} storageKey="rakna_tip_wallet" />

      {/* Top up */}
      <div style={{ background: C.white, borderRadius: R.card, padding: 18, marginTop: 16, boxShadow: SHADOW.soft }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: C.black }}>{t('add_money')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {AMOUNTS.map((a) => (
            <button key={a} onClick={() => setAmount(a)} style={{
              padding: '12px 0', borderRadius: R.md, border: 'none', cursor: 'pointer', fontWeight: 700,
              background: amount === a ? C.yellow : C.grey, color: amount === a ? C.ink : C.black,
            }}>{a}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[{ k: 'card', l: t('pay_card') }, { k: 'transfer', l: t('pay_transfer') }].map((m) => (
            <button key={m.k} onClick={() => setMethod(m.k)} style={{
              flex: 1, padding: '11px', borderRadius: R.md, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              border: '1.5px solid ' + (method === m.k ? C.yellow : C.greyMid),
              background: method === m.k ? C.yellowSoft : C.white, color: C.black,
            }}>{m.l}</button>
          ))}
        </div>
        <button onClick={topUp} disabled={busy} style={{
          width: '100%', padding: '15px', borderRadius: R.pill, border: 'none',
          background: C.yellow, color: C.ink, fontWeight: 700, fontSize: '1rem', cursor: busy ? 'wait' : 'pointer', boxShadow: SHADOW.yellow, opacity: busy ? 0.7 : 1,
        }}>{busy ? t('saving') : `${t('top_up')} ${amount} LYD`}</button>
      </div>

      {/* Transactions */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: C.black, margin: '22px 0 12px' }}>{t('transactions')}</h3>
      <div style={{ background: C.white, borderRadius: R.card, padding: '6px 18px', boxShadow: SHADOW.soft, marginBottom: 20 }}>
        {txns.length === 0 ? (
          <p style={{ color: C.textMuted, textAlign: 'center', padding: '20px 0', fontSize: '0.9rem' }}>{t('no_transactions')}</p>
        ) : txns.map((x, i) => (
          <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < txns.length - 1 ? '1px solid ' + C.grey : 'none' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: C.black, fontWeight: 500 }}>{x.type === 'topup' ? t('top_up') : (x.note || 'Payment')}</div>
              <div style={{ fontSize: '0.72rem', color: C.textMuted }}>{x.method || x.type}</div>
            </div>
            <span style={{ fontWeight: 700, color: x.amount > 0 ? C.available : C.danger }}>{x.amount > 0 ? '+' : ''}{x.amount} LYD</span>
          </div>
        ))}
      </div>
    </MobileLayout>
  )
}
