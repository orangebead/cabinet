import { useState } from 'react'
import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'
import type { Profile } from '../types'

interface Props {
  onViewProfile: (username: string) => void
  onViewCabinet: (userId: string, username: string) => void
}

export function FriendsPage({ onViewProfile, onViewCabinet }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const { user } = useAuthStore()
  const { profile: ownProfile, searchProfiles, isFollowing, follow, unfollow } = useProfileStore()
  const [followState, setFollowState] = useState<Record<string, boolean>>({})

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const data = await searchProfiles(q)
    const filtered = data.filter(p => p.id !== user?.id)
    setResults(filtered)

    // check follow state for each result
    if (user) {
      const states: Record<string, boolean> = {}
      await Promise.all(filtered.map(async p => {
        states[p.id] = await isFollowing(user.id, p.id)
      }))
      setFollowState(states)
    }
    setSearching(false)
  }

  const toggleFollow = async (profile: Profile) => {
    if (!user) return
    const currently = followState[profile.id]
    setFollowState(prev => ({ ...prev, [profile.id]: !currently }))
    if (currently) await unfollow(user.id, profile.id)
    else await follow(user.id, profile.id)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 2, lineHeight: 1 }}>Friends</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>Find and follow other players</p>
      </div>

      <div style={{ padding: '28px 32px', flex: 1 }}>
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 480, marginBottom: 32 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 16 }}>🔍</span>
          <input
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by username..."
            style={{ width: '100%', padding: '12px 14px 12px 42px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          {searching && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 12 }}>Searching...</span>}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>RESULTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 560 }}>
              {results.map(p => (
                <SearchResultCard
                  key={p.id}
                  profile={p}
                  isFollowing={followState[p.id] ?? false}
                  onToggleFollow={() => toggleFollow(p)}
                  onViewProfile={() => onViewProfile(p.username)}
                  onViewCabinet={() => onViewCabinet(p.id, p.username)}
                />
              ))}
            </div>
          </div>
        )}

        {query.length >= 2 && !searching && results.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 14, padding: '20px 0' }}>No users found for "{query}"</div>
        )}

        {query.length < 2 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
            <div style={{ fontSize: 15, marginBottom: 6 }}>Find your friends</div>
            <div style={{ fontSize: 13 }}>Search by their username to find and follow them</div>
          </div>
        )}
      </div>
    </div>
  )
}

function SearchResultCard({ profile, isFollowing, onToggleFollow, onViewProfile, onViewCabinet }: {
  profile: Profile
  isFollowing: boolean
  onToggleFollow: () => void
  onViewProfile: () => void
  onViewCabinet: () => void
}) {
  const initial = (profile.display_name || profile.username)[0].toUpperCase()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, transition: 'border-color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--muted)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 20, color: '#000', flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.display_name || profile.username}</div>
        <div style={{ color: 'var(--muted)', fontSize: 12 }}>@{profile.username}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onViewProfile} style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          Profile
        </button>
        {profile.is_public && (
          <button onClick={onViewCabinet} style={{ padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            Cabinet
          </button>
        )}
        <button onClick={onToggleFollow} style={{ padding: '7px 14px', borderRadius: 7, border: isFollowing ? '1px solid var(--border)' : 'none', background: isFollowing ? 'transparent' : 'var(--accent)', color: isFollowing ? 'var(--muted)' : '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => { if (isFollowing) { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171' } }}
          onMouseLeave={e => { if (isFollowing) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' } }}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      </div>
    </div>
  )
}