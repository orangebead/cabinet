import { useState } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'register'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setMessage(null)
    setLoading(true)


    if (!email || !password) { setError('Please fill in all fields.'); setLoading(false); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email for a confirmation link from "Supabase"!')
    }

    setLoading(false)
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
    // no need to setLoading(false) on success — browser navigates away to Google
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    < div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }
    }>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 52, letterSpacing: 0.1, color: 'var(--accent)', lineHeight: 1, fontWeight: 700 }}>Cabinet</div>
          <div style={{ color: 'var(--muted)', fontSize: 20, marginTop: 6, letterSpacing: 0.1 }}>Your Personal Game Shelf</div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 28px' }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 10, padding: 3, marginBottom: 28 }}>
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setMessage(null) }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: mode === m ? 'var(--surface)' : 'transparent', color: mode === m ? 'var(--text)' : 'var(--muted)', fontWeight: mode === m ? 600 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none', textTransform: 'capitalize' }}>
                {m}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid var(--border)', background: googleLoading ? 'var(--surface2)' : 'var(--surface2)', color: googleLoading ? 'var(--muted)' : 'var(--text)', fontWeight: 600, fontSize: 13, cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}
            onMouseEnter={e => { if (!googleLoading) e.currentTarget.style.borderColor = 'var(--muted)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {googleLoading ? 'Redirecting...' : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, letterSpacing: 0.1 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Email + password fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Email" type="email" value={email} onChange={setEmail} onKeyDown={handleKeyDown} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} onKeyDown={handleKeyDown} placeholder="••••••••" />
          </div>

          {/* Error / message */}
          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#3f1a1a', border: '1px solid #5a2a2a', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#1a3f1a', border: '1px solid #2a5a2a', borderRadius: 8, color: '#4ade80', fontSize: 13 }}>
              {message}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', marginTop: 22, padding: '13px 0', borderRadius: 10, border: 'none', background: loading ? 'var(--surface2)' : 'var(--accent)', color: loading ? 'var(--muted)' : '#000', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', boxShadow: loading ? 'none' : '0 4px 20px rgba(232,255,71,0.2)' }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--muted)', fontSize: 12 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setMessage(null) }} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>
            {mode === 'login' ? 'Register' : 'Sign in'}
          </span>
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, color: 'var(--muted)', fontSize: 11 }}>
          By signing in, you agree to our{' '}
          <span
            onClick={() => setShowPrivacy(true)}
            style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
          >
            About & Privacy Notice
          </span>
        </div>
      </div>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div >
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

interface PrivacyModalProps { onClose: () => void }
function PrivacyModal({ onClose }: PrivacyModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
        zIndex: 200, display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, width: '100%', maxWidth: 440,
          padding: 24, display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)', fontFamily: 'Rethink Sans, sans-serif'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: 24, letterSpacing: 0.1, color: 'var(--accent)' }}>
            Privacy & Security
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0 }}>
            Cabinet is a personal, non-commercial game shelf project built to track our video game collections and play sessions.
          </p>
          <p style={{ margin: 0 }}>
            Your gaming shelf configuration is secured at the database layer using PostgreSQL Row Level Security (RLS).
          </p>
          <blockquote style={{ margin: 0, padding: '10px 14px', background: 'var(--bg)', borderLeft: '3px solid var(--accent)', borderRadius: 6, color: 'var(--muted)', fontSize: 12 }}>
            "Even if someone manages to find or guess your public project API keys, they are hard-blocked from viewing, modifying, or deleting any game logs belonging to your account."
          </blockquote>
          <p style={{ margin: 0 }}>
            By default, your shelf layout is <strong>Public</strong> so friends can view your cabinet and follow your progression tracker, but you can toggle your profile to <strong>Private</strong> anytime inside your account management console to lock down visibility completely.
          </p>
          <p style={{ margin: 0 }}>
            We do not sell, share, or track your data with any third-party services. Because this is a shared hobby project, it is provided entirely "as-is" with no uptime guarantees or formal Service Level Agreements (SLA).
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 20, padding: '10px 0', borderRadius: 8,
            background: 'var(--surface2)', color: 'var(--text)', fontWeight: 600,
            fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
            transition: 'all 0.15s', fontFamily: 'Rethink Sans, sans-serif'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface2)')}
        >
          Understood, Close
        </button>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, onKeyDown, placeholder }: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  placeholder: string
}) {
  return (
    <div>
      <label style={{ display: 'block', color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: 0.1, marginBottom: 7, textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{ width: '100%', padding: '11px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
        onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}