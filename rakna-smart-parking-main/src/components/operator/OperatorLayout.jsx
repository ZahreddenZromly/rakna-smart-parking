import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { C, FONT, R } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/authService'
import Icon from '../common/Icon'

const TABS = [
  { to: '/operator/dashboard', label: 'نظرة عامة',    icon: 'settings' },
  { to: '/operator/queue',     label: 'الطابور',       icon: 'clock' },
  { to: '/operator/bookings',  label: 'الحجوزات',      icon: 'ticket' },
]

export default function OperatorLayout({ children }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { t }     = useSettings()
  const { loading, isOperator } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, background: C.grey }}>
      {t('loading')}
    </div>
  )

  if (!isOperator) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FONT, background: C.grey }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <p style={{ color: C.textMuted, fontFamily: FONT }}>للمشغلين فقط.</p>
      <button onClick={() => navigate('/operator/login')} style={{ background: 'var(--brand)', color: 'var(--on-ink)', border: 'none', padding: '12px 24px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
        تسجيل الدخول
      </button>
    </div>
  )

  const handleLogout = async () => {
    try { await logoutUser() } catch {}
    navigate('/operator/login')
  }

  const SidebarContent = () => (
    <>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏢</span>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', fontFamily: FONT }}>بوابة المشغل</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        {TABS.map((tab) => {
          const active = location.pathname === tab.to
          return (
            <button key={tab.to} onClick={() => { navigate(tab.to); setOpen(false) }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 12px', borderRadius: R.md, marginBottom: 4,
              border: 'none', outline: 'none', cursor: 'pointer', fontFamily: FONT,
              background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.65)',
              fontWeight: active ? 700 : 500, fontSize: '0.88rem', textAlign: 'start',
            }}>
              <Icon name={tab.icon} size={18} color={active ? '#fff' : 'rgba(255,255,255,0.65)'} />
              {tab.label}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={handleLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: R.md,
          border: 'none', outline: 'none', cursor: 'pointer', fontFamily: FONT,
          background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
          fontSize: '0.82rem', fontWeight: 600, textAlign: 'start',
        }}>
          <Icon name="logout" size={16} color="rgba(255,255,255,0.8)" />
          {t('log_out')}
        </button>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        .op-wrap { display: flex; min-height: 100vh; background: ${C.grey}; font-family: ${FONT}; direction: rtl; }
        .op-sidebar {
          width: 210px; flex-shrink: 0; background: #1a3a6e;
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
        }
        .op-topbar { display: none; }
        .op-main { flex: 1; padding: clamp(16px,3vw,32px); padding-bottom: 40px; }
        @media (max-width: 1023px) {
          .op-sidebar { display: none; }
          .op-topbar  { display: flex; position: sticky; top: 0; z-index: 50; }
          .op-main    { padding: 12px 14px 32px; }
        }
      `}</style>

      <div className="op-wrap">
        <aside className="op-sidebar"><SidebarContent /></aside>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* توب بار */}
          <div className="op-topbar" style={{
            background: '#1a3a6e', color: '#fff',
            height: 56, padding: '0 16px',
            alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setOpen(true)} style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', outline: 'none',
                color: '#fff', width: 36, height: 36, borderRadius: 8,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa-solid fa-bars" style={{ fontSize: 16 }} />
              </button>
              <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: FONT }}>🏢 بوابة المشغل</span>
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', outline: 'none', padding: '6px 12px',
              borderRadius: R.pill, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: FONT,
            }}>{t('log_out')}</button>
          </div>

          {/* Drawer */}
          {open && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
              <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
              <div style={{
                position: 'relative', width: 260, height: '100%',
                background: '#1a3a6e', display: 'flex', flexDirection: 'column',
                boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 12px 0' }}>
                  <button onClick={() => setOpen(false)} style={{
                    background: 'rgba(255,255,255,0.15)', border: 'none', outline: 'none',
                    color: '#fff', width: 32, height: 32, borderRadius: 8,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="fa-solid fa-xmark" style={{ fontSize: 16 }} />
                  </button>
                </div>
                <SidebarContent />
              </div>
            </div>
          )}

          <main className="op-main">{children}</main>
        </div>
      </div>
    </>
  )
}