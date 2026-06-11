import { useState, useEffect } from 'react'
import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'
import { useIsMobile } from '../hooks/useIsMobile'
import { STATUS_COLORS, STATUS_LABELS } from '../store/cabinetStore'
import type { Profile, CabinetGame, GameStatus } from '../types'

interface Props {
  username?: string
  onViewCabinet?: (userId: string, username: string) => void
}

export function ProfilePage({ username, onViewCabinet }: Props) {
  const { user } = useAuthStore()
  const {
    profile: ownProfile, getProfileByUsername, getProfileGames,
    getFollowerCount, getFollowingCount, isFollowing, follow, unfollow,
    updateProfile, getFollowing,
  } = useProfileStore()
  const isMobile = useIsMobile()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [games, setGames] = useState<CabinetGame[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [following, setFollowing] = useState(false)
  const [followingList, setFollowingList] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBio, setEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')
  const [activeTab, setActiveTab] = useState<'games' | 'following'>('games')

  const isOwn = !username || username === ownProfile?.username

  useEffect(() => { load() }, [username, ownProfile])

  const load = async () => {
    setLoading(true)
    const p = isOwn ? ownProfile : await getProfileByUsername(username!)
    if (!p) { setLoading(false); return }

    setProfile(p)
    setBioText(p.bio ?? '')

    const [g, followers, followingCnt, followingL] = await Promise.all([
      getProfileGames(p.id),
      getFollowerCount(p.id),
      getFollowingCount(p.id),
      isOwn ? getFollowing(p.id) : Promise.resolve([]),
    ])

    setGames(g)
    setFollowerCount(followers)
    setFollowingCount(followingCnt)
    setFollowingList(followingL)

    if (!isOwn && user) {
      const f = await isFollowing(user.id, p.id)
      setFollowing(f)
    }
    setLoading(false)
  }

  const handleFollow = async () => {
    if (!user || !profile) return
    if (following) {
      await unfollow(user.id, profile.id)
      setFollowing(false)
      setFollowerCount(c => c - 1)
    } else {
      await follow(user.id, profile.id)
      setFollowing(true)
      setFollowerCount(c => c + 1)
    }
  }

  const saveBio = async () => {
    if (!user) return
    await updateProfile(user.id, { bio: bioText || null })
    setProfile(p => p ? { ...p, bio: bioText || null } : p)
    setEditingBio(false)
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!profile) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--muted)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
        <div>Profile not found</div>
      </div>
    </div>
  )

  const cabinetGames = games.filter(g => g.list === 'cabinet')
  const total = cabinetGames.length
  const completed = cabinetGames.filter(g => g.status === 'completed' || g.status === 'hundred_percent').length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const avgRating = (() => {
    const rated = cabinetGames.filter(g => g.rating)
    if (!rated.length) return null
    return (rated.reduce((sum, g) => sum + g.rating!, 0) / rated.length).toFixed(1)
  })()

  const initial = (profile.display_name || profile.username)[0].toUpperCase()
  const pad = isMobile ? '20px 16px' : '32px 40px'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Profile card ───────────────────────────────────── */}
      <div style={{ padding: pad, borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 600 }}>

          {/* Top: avatar + name + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            {/* Avatar */}
            <div style={{ width: isMobile ? 56 : 68, height: isMobile ? 56 : 68, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: isMobile ? 26 : 32, color: '#000', flexShrink: 0 }}>
              {initial}
            </div>

            {/* Name + username */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: isMobile ? 26 : 30, letterSpacing: 1, lineHeight: 1 }}>
                  {profile.display_name || profile.username}
                </h1>
                {!profile.is_public && (
                  <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>Private</span>
                )}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>@{profile.username}</div>
            </div>

            {/* Follow button — other profiles only */}
            {!isOwn && user && (
              <button
                onClick={handleFollow}
                style={{ padding: '8px 18px', borderRadius: 8, border: following ? '1px solid var(--border)' : 'none', background: following ? 'transparent' : 'var(--accent)', color: following ? 'var(--muted)' : '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', flexShrink: 0 }}
                onMouseEnter={e => { if (following) { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171' } }}
                onMouseLeave={e => { if (following) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' } }}
              >
                {following ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

          {/* Bio */}
          <div style={{ marginBottom: 16 }}>
            {isOwn && editingBio ? (
              <div>
                <textarea
                  value={bioText}
                  onChange={e => setBioText(e.target.value)}
                  placeholder="Write something about yourself..."
                  maxLength={160}
                  rows={2}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <SmBtn label="Save" accent onClick={saveBio} />
                  <SmBtn label="Cancel" onClick={() => { setEditingBio(false); setBioText(profile.bio ?? '') }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <p style={{ margin: 0, color: profile.bio ? 'var(--text)' : 'var(--muted)', fontSize: 13, fontStyle: profile.bio ? 'normal' : 'italic', lineHeight: 1.5, flex: 1 }}>
                  {profile.bio ?? (isOwn ? 'No bio yet.' : '')}
                </p>
                {isOwn && <SmBtn label="Edit" onClick={() => setEditingBio(true)} />}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 0, background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {[
              { label: 'Games', value: total },
              { label: 'Done', value: `${completionPct}%` },
              ...(avgRating ? [{ label: 'Avg', value: avgRating, accent: true }] : []),
              { label: 'Followers', value: followerCount },
              { label: 'Following', value: followingCount },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1, color: s.accent ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 3, fontWeight: 600, letterSpacing: 0.5 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Own profile controls */}
          {isOwn && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>Public profile</span>
              <div
                onClick={() => user && updateProfile(user.id, { is_public: !profile.is_public }).then(() => setProfile(p => p ? { ...p, is_public: !p.is_public } : p))}
                style={{ width: 36, height: 20, borderRadius: 10, background: profile.is_public ? 'var(--accent)' : 'var(--surface2)', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <div style={{ position: 'absolute', top: 2, left: profile.is_public ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: profile.is_public ? '#000' : 'var(--muted)', transition: 'left 0.2s' }} />
              </div>
            </div>
          )}

          {/* View cabinet button — other profiles */}
          {!isOwn && profile.is_public && onViewCabinet && (
            <button
              onClick={() => onViewCabinet(profile.id, profile.username)}
              style={{ marginTop: 14, width: '100%', padding: '10px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              View Cabinet →
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 400 }}>
          {(['games', 'following'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '14px 0', border: 'none', background: 'transparent',
                color: activeTab === tab ? 'var(--text)' : 'var(--muted)',
                fontWeight: activeTab === tab ? 700 : 400,
                fontSize: 13, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {tab === 'games' ? `Games (${total})` : `Following (${followingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────── */}
      <div style={{ padding: pad, flex: 1 }}>

        {/* Games tab */}
        {activeTab === 'games' && (
          <>
            {/* Status chips */}
            {total > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {(['unplayed', 'in_progress', 'completed', 'hundred_percent'] as GameStatus[]).map(s => {
                  const count = cabinetGames.filter(g => g.status === s).length
                  if (!count) return null
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px' }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: STATUS_COLORS[s], flexShrink: 0 }} />
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>{STATUS_LABELS[s]}</span>
                      <span style={{ fontWeight: 700, fontSize: 12 }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {total === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🎮</div>
                <div style={{ fontSize: 14 }}>{isOwn ? 'Your cabinet is empty.' : 'No games yet.'}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                {cabinetGames.map(game => (
                  <div key={game.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '3/4' }}>
                    {game.cover
                      ? <img src={game.cover} alt={game.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎮</div>
                    }
                    <div style={{ position: 'absolute', top: 5, left: 5, background: STATUS_COLORS[game.status], color: game.status === 'unplayed' ? '#fff' : '#000', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 3 }}>
                      {STATUS_LABELS[game.status]}
                    </div>
                    {game.rating && (
                      <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.8)', color: 'var(--accent)', fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, fontFamily: 'Bebas Neue' }}>
                        {game.rating}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Following tab */}
        {activeTab === 'following' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500 }}>
            {followingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                <div style={{ fontSize: 14 }}>{isOwn ? "You're not following anyone yet." : 'Not following anyone.'}</div>
              </div>
            ) : (
              followingList.map(p => {
                const init = (p.display_name || p.username)[0].toUpperCase()
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 16, color: '#000', flexShrink: 0 }}>
                      {init}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.display_name || p.username}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 11 }}>@{p.username}</div>
                    </div>
                    {p.is_public && onViewCabinet && (
                      <SmBtn label="Cabinet" onClick={() => onViewCabinet(p.id, p.username)} />
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SmBtn({ label, onClick, accent }: { label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '6px 12px', borderRadius: 7, border: accent ? 'none' : '1px solid var(--border)', background: accent ? 'var(--accent)' : 'transparent', color: accent ? '#000' : 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', flexShrink: 0 }}
      onMouseEnter={e => { if (!accent) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' } }}
      onMouseLeave={e => { if (!accent) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' } }}
    >
      {label}
    </button>
  )
}