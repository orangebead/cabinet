import { useState } from 'react'
import { useProfileStore } from '../store/profileStore'

interface Props { userId: string }

export function ProfileSetupPage({ userId }: Props) {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { createProfile } = useProfileStore()

  const handleSubmit = async () => {
    setError(null)
    if (!username) { setError('Username is required.'); return }
    if (username.length < 3) { setError('Username must be at least 3 characters.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username can only contain letters, numbers, and underscores.'); return }

    setLoading(true)
    const { error } = await createProfile(userId, username, displayName)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 52, letterSpacing: 0.1, color: 'var(--accent)', lineHeight: 1 }}>CABINET</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>ONE LAST STEP</div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 28px' }}>
          <h2 style={{ margin: '0 0 6px', fontFamily: 'Space Grotesk', fontSize: 26, letterSpacing: 0.1 }}>Set up your profile</h2>
          <p style={{ margin: '0 0 24px', color: 'var(--muted)', fontSize: 13 }}>Pick a username so friends can find you.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: 0.1, marginBottom: 7, textTransform: 'uppercase' }}>Username *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 14 }}>@</span>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="yourname"
                  maxLength={20}
                  style={{ width: '100%', padding: '11px 14px 11px 28px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: 0.1, marginBottom: 7, textTransform: 'uppercase' }}>Display Name <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your Name"
                maxLength={40}
                style={{ width: '100%', padding: '11px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9, color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', background: '#3f1a1a', border: '1px solid #5a2a2a', borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', marginTop: 24, padding: '13px 0', borderRadius: 10, border: 'none', background: loading ? 'var(--surface2)' : 'var(--accent)', color: loading ? 'var(--muted)' : '#000', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', boxShadow: loading ? 'none' : '0 4px 20px rgba(232,255,71,0.2)' }}
          >
            {loading ? 'Creating...' : 'Create Profile →'}
          </button>
        </div>
      </div>
    </div>
  )
}