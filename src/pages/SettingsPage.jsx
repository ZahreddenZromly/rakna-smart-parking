import { useNavigate } from 'react-router-dom'
import MobileLayout from '../components/common/MobileLayout'
import TopBar from '../components/common/TopBar'
import { C, R, SHADOW } from '../styles/theme'
import { useSettings } from '../context/SettingsContext'
import Icon from '../components/common/Icon'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { theme, setTheme, lang, setLang, fontScale, setFontScale, voice, setVoice, speak, t } = useSettings()

  return (
    <MobileLayout bottomNav={false} bg={C.grey}>
      <TopBar title={t('settings')} />

      <Section title={t('appearance')}>
        <Toggle
          options={[
            { key: 'light', label: t('light_mode') },
            { key: 'dark', label: t('dark_mode') },
          ]}
          value={theme}
          onChange={setTheme}
        />
      </Section>

      <Section title={t('language')}>
        <Toggle
          options={[
            { key: 'en', label: 'English' },
            { key: 'ar', label: 'العربية' },
          ]}
          value={lang}
          onChange={setLang}
        />
      </Section>

      <Section title={t('accessibility')}>
        {/* Text size */}
        <div style={{ padding: '6px 6px 14px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.black, marginBottom: 10, paddingInlineStart: 6 }}>{t('text_size')}</div>
          <Toggle
            small
            options={[
              { key: 1, label: 'A · ' + t('text_normal') },
              { key: 1.15, label: 'A · ' + t('text_large') },
              { key: 1.3, label: 'A · ' + t('text_xlarge') },
            ]}
            value={fontScale}
            onChange={setFontScale}
          />
        </div>

        {/* Voice guidance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px' }}>
          <Icon name="voice" size={24} color={C.black} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: C.black, fontSize: '0.92rem' }}>{t('voice_guidance')}</div>
            <div style={{ fontSize: '0.75rem', color: C.textMuted }}>{t('voice_desc')}</div>
          </div>
          <Switch
            on={voice}
            onClick={() => {
              const next = !voice
              setVoice(next)
              if (next) setTimeout(() => speak(t('voice_guidance')), 60)
            }}
          />
        </div>
      </Section>

      <button onClick={() => navigate('/onboarding')} style={{
        width: '100%', padding: '15px', borderRadius: R.pill, border: '1.5px solid ' + C.greyMid,
        background: C.white, color: C.black, fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer', marginTop: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Icon name="map" size={18} /> {t('replay_tutorial')}
      </button>

      <p style={{ textAlign: 'center', color: C.textMuted, fontSize: '0.78rem', marginTop: 24 }}>
        {t('appName')} · v1.0
      </p>
    </MobileLayout>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <h3 style={{ fontSize: '0.85rem', color: C.textMuted, fontWeight: 600, margin: '0 4px 10px' }}>{title}</h3>
      <div style={{ background: C.white, borderRadius: R.card, padding: 8, boxShadow: SHADOW.soft }}>
        {children}
      </div>
    </div>
  )
}

function Toggle({ options, value, onChange, small }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map((o) => {
        const active = value === o.key
        return (
          <button key={String(o.key)} onClick={() => onChange(o.key)} style={{
            flex: 1, padding: small ? '11px 4px' : '14px', borderRadius: R.md, border: 'none', cursor: 'pointer',
            background: active ? C.yellow : 'transparent',
            color: active ? C.ink : C.textSoft,
            fontWeight: active ? 700 : 500, fontSize: small ? '0.8rem' : '0.92rem', transition: 'all 0.15s',
          }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Switch({ on, onClick }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{
      width: 50, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
      background: on ? C.yellow : C.greyMid, transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, insetInlineStart: on ? 25 : 3,
        width: 22, height: 22, borderRadius: '50%', background: C.white, transition: 'inset-inline-start 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}
