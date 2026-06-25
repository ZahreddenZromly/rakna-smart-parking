import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { C, FONT, R, SHADOW } from '../../styles/theme'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../firebase/authService'
import Icon from '../common/Icon'

const TABS = [
  { to: '/admin',           key: 'a_overview',  icon: 'settings' },
  { to: '/admin/users',     key: 'a_users',     icon: 'user' },
  { to: '/admin/content',   key: 'a_content',   icon: 'news' },
  { to: '/admin/parkings',  key: 'a_parkings',  icon: 'pin' },
  { to: '/admin/queue',     key: 'a_queue',     icon: 'clock' },
  { to: '/admin/partners',  key: 'a_partners',  icon: 'building' },
  { to: '/admin/analytics', key: 'a_analytics', icon: 'star' },
]

export default function AdminLayout({ children }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { t }     = useSettings()
  const { loading, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, background: C.grey }}>
      {t('loading')}
    </div>
  )

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FONT, background: C.grey }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <p style={{ color: C.textMuted, fontFamily: FONT }}>للمديرين فقط.</p>
      <button onClick={() => navigate('/map')} style={{ background: 'var(--brand)', color: 'var(--on-ink)', border: 'none', padding: '12px 24px', borderRadius: R.pill, fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
        {t('back_to_app')}
      </button>
    </div>
  )

  const handleLogout = async () => {
    try { await logoutUser() } catch {}
    navigate('/')
  }

  const SidebarContent = () => (
    <>
      {/* لوقو */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="logo" size={26} color="#60A5FA" />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', fontFamily: FONT }}>
            {t('admin_panel')}
          </span>
        </div>
      </div>
      {/* روابط */}
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
              transition: 'all 0.15s',
            }}>
              <Icon name={tab.icon} size={18} color={active ? '#fff' : 'rgba(255,255,255,0.65)'} />
              {t(tab.key)}
            </button>
          )
        })}
      </nav>
      {/* أسفل */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => navigate('/map')} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: R.md, marginBottom: 4,
          border: 'none', outline: 'none', cursor: 'pointer', fontFamily: FONT,
          background: 'transparent', color: 'rgba(255,255,255,0.65)',
          fontSize: '0.82rem', fontWeight: 500, textAlign: 'start',
        }}>
          <Icon name="map" size={16} color="rgba(255,255,255,0.65)" />
          {t('back_to_app')}
        </button>
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
        .adm-wrap { display: flex; min-height: 100vh; background: ${C.grey}; font-family: ${FONT}; direction: rtl; }
        .adm-sidebar {
          width: 220px; flex-shrink: 0; background: var(--brand);
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
        }
        .adm-topbar { display: none; }
        .adm-drawer-overlay { display: none; }
        .adm-drawer { display: none; }
        .adm-main { flex: 1; padding: clamp(16px,3vw,32px); padding-bottom: 40px; overflow-y: auto; }

        @media (max-width: 1023px) {
          .adm-sidebar { display: none; }
          .adm-topbar  { display: flex; position: sticky; top: 0; z-index: 50; }
          .adm-main    { padding: 12px 14px 32px; }
        }
      `}</style>

      <div className="adm-wrap">

        {/* سايدبار ديسكتوب */}
        <aside className="adm-sidebar">
          <SidebarContent />
        </aside>

        {/* توب بار موبايل+تابلت */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="adm-topbar" style={{
            background: 'var(--brand)', color: '#fff',
            height: 56, padding: '0 16px',
            alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* زر الـ Hamburger */}
              <button onClick={() => setOpen(true)} style={{
                background: 'rgba(255,255,255,0.12)', border: 'none', outline: 'none',
                color: '#fff', width: 36, height: 36, borderRadius: 8,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa-solid fa-bars" style={{ fontSize: 16 }} />
              </button>
              <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: FONT }}>
                {t('admin_panel')}
              </span>
            </div>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: 'none', outline: 'none', padding: '6px 12px',
              borderRadius: R.pill, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: FONT,
            }}>{t('log_out')}</button>
          </div>

          {/* Drawer overlay */}
          {open && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
              {/* الخلفية الشفافة */}
              <div onClick={() => setOpen(false)} style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
              }} />
              {/* الدراور */}
              <div style={{
                position: 'relative', width: 260, height: '100%',
                background: 'var(--brand)', display: 'flex', flexDirection: 'column',
                boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
                animation: 'slideInRight 0.25s ease',
                insetInlineStart: 0,
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

          {/* المحتوى */}
          <main className="adm-main">{children}</main>
        </div>
      </div>
    </>
  )
}