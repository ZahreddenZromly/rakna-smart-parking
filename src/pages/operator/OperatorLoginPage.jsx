import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { C, R, SHADOW, FONT } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import Icon from '../../components/common/Icon'
import { getOperatorByEmail } from '../../firebase/operatorService'

export default function OperatorLoginPage() {
  const { t } = useSettings()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const op = await getOperatorByEmail(email)
      if (!op) {
        setError(t('op_email_not_found'))
      } else if (op.status !== 'active') {
        setError(t('op_account_inactive'))
      } else {
        navigate(`/operator/dashboard?lot=${op.lotId}&email=${encodeURIComponent(op.email)}`)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 60%, #6c5ce7 100%)`,
      padding: 20, fontFamily: FONT,
    }}>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: C.white, borderRadius: R.card,
        padding: '36px 32px', boxShadow: SHADOW.float,
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 58, height: 58, borderRadius: R.md, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: SHADOW.brand,
          }}>
            <Icon name="shield" size={28} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: C.black, fontFamily: FONT }}>
            {t('op_portal_login')}
          </h1>
          <p style={{ margin: '6px 0 0', color: C.textMuted, fontSize: '0.85rem', fontFamily: FONT }}>
            {t('op_portal_sub')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.82rem', color: C.textSoft, marginBottom: 6, fontFamily: FONT }}>
              {t('op_enter_email')}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }}>
                <Icon name="user" size={17} color={C.textMuted} />
              </div>
              <input
                required type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null) }}
                placeholder="operator@example.com"
                style={{
                  width: '100%', padding: '13px 13px 13px 42px',
                  border: `1.5px solid ${error ? C.danger : C.greyMid}`,
                  borderRadius: R.md, fontFamily: FONT, fontSize: '0.95rem',
                  color: C.text, background: C.white,
                  boxSizing: 'border-box', outline: 'none',
                  transition: 'border-color 0.18s',
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(214,48,49,0.07)', border: `1px solid rgba(214,48,49,0.2)`,
              borderRadius: R.sm, padding: '10px 13px', marginBottom: 16,
            }}>
              <Icon name="bell" size={15} color={C.danger} />
              <span style={{ color: C.danger, fontSize: '0.84rem', fontFamily: FONT, fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(90deg, var(--brand) 0%, var(--brand-dark) 100%)',
              color: '#fff', border: 'none', borderRadius: R.pill,
              fontWeight: 700, fontSize: '1rem', fontFamily: FONT,
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: SHADOW.brand, opacity: loading ? 0.75 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? 'Checking…' : <><Icon name="shield" size={17} color="#fff" /> {t('op_continue')}</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.82rem', fontFamily: FONT }}>
          <Link to="/login" style={{ color: C.textMuted, textDecoration: 'none' }}>← {t('back_to_app')}</Link>
        </p>
      </div>
    </div>
  )
}
