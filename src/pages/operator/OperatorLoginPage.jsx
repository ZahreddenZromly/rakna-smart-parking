import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function OperatorLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/operator/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Segoe UI, sans-serif', background: '#1a1a2e' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🏢</div>
            <h2 style={{ margin: '0.5rem 0', color: '#1a1a2e' }}>Operator Portal</h2>
            <p style={{ color: '#636e72', fontSize: '0.9rem' }}>Sign in to manage your parking lots</p>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Operator Email', key: 'email', type: 'email', placeholder: 'operator@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: '#1a1a2e', fontSize: '0.9rem' }}>{f.label}</label>
                <input
                  type={f.type} required placeholder={f.placeholder} value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
            ))}

            <button type="submit" style={{
              width: '100%', padding: '13px', background: '#1a1a2e', color: '#fff',
              border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem',
            }}>
              Sign In as Operator
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
            <Link to="/login" style={{ color: '#636e72', textDecoration: 'none' }}>← Driver Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

