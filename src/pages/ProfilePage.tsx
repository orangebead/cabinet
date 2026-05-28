import { useState, useEffect } from 'react'
import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'
import { STATUS_COLORS, STATUS_LABELS } from '../store/cabinetStore'
import type { Profile, CabinetGame, GameStatus } from '../types'

interface Props {
  username?: string // if undefined, show own profile
  onViewCabinet?: (userId: string, username: string) => void
}

export function ProfilePage({ username, onViewCabinet }: Props) {
  const { user } = useAuthStore()
  const { profile: ownProfile, getProfileByUsername, getProfileGames, getFollowerCount, getFollowingCount, isFollowing, follow, unfollow, updateProfile, getFollowing } = useProfileStore()

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

  useEffect(() => {
    load()
  }, [username, ownProfile])

  const load = async () => {
    setLoading(true)
    const p = isOwn ? ownProfile : await getProfileByUsername(username!)
    if (!p) { setLoading(false); return }

    setProfile(p)
    setBioText(p.bio ?? '')

    const [games, followers, followingCnt, followingL] = await Promise.all([
      getProfileGames(p.id),
      getFollowerCount(p.id),
      getFollowingCount(p.id),
      isOwn ? getFollowing(p.id) : Promise.resolve([]),
    ])

    setGames(games)
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
    setEditingBio(false)
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 3, opacity: 0.4 }}>Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
          <div style={{ fontSize: 16 }}>Profile not found</div>
        </div>
      </div>
    )
  }

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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '40px 40px 32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, maxWidth: 800 }}>
          {/* Avatar */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 32, color: '#000', flexShrink: 0 }}>
            {initial}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 1.5, lineHeight: 1 }}>
                {profile.display_name || profile.username}
              </h1>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>@{profile.username}</span>
              {!profile.is_public && (
                <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Private</span>
              )}
            </div>

            {/* Bio */}
            <div style={{ marginTop: 10 }}>
              {isOwn && editingBio ? (
                <div>
                  <textarea
                    value={bioText}
                    onChange={e => setBioText(e.target.value)}
                    placeholder="Write something about yourself..."
                    maxLength={160}
                    style={{ width: '100%', maxWidth: 500, padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
                    rows={2}
                    onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <SmallBtn label="Save" accent onClick={saveBio} />
                    <SmallBtn label="Cancel" onClick={() => setEditingBio(false)} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <p style={{ margin: 0, color: profile.bio ? 'var(--text)' : 'var(--muted)', fontSize: 13, fontStyle: profile.bio ? 'normal' : 'italic' }}>
                    {profile.bio ?? (isOwn ? 'No bio yet.' : '')}
                  </p>
                  {isOwn && <SmallBtn label="Edit bio" onClick={() => setEditingBio(true)} />}
                </div>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
              <Stat label="Games" value={total} />
              <Stat label="Completed" value={`${completionPct}%`} />
              {avgRating && <Stat label="Avg Rating" value={avgRating} accent />}
              <Stat label="Followers" value={followerCount} />
              <Stat label="Following" value={followingCount} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            {!isOwn && user && (
              <button
                onClick={handleFollow}
                style={{ padding: '9px 20px', borderRadius: 9, border: following ? '1px solid var(--border)' : 'none', background: following ? 'transparent' : 'var(--accent)', color: following ? 'var(--muted)' : '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', minWidth: 100 }}
                onMouseEnter={e => { if (following) { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' } }}
                onMouseLeave={e => { if (following) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' } }}
              >
                {following ? 'Unfollow' : 'Follow'}
              </button>
            )}
            {!isOwn && onViewCabinet && (
              <button
                onClick={() => onViewCabinet(profile.id, profile.username)}
                style={{ padding: '9px 20px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                View Cabinet
              </button>
            )}
            {isOwn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>Public profile</span>
                <div
                  onClick={() => user && updateProfile(user.id, { is_public: !profile.is_public }).then(() => setProfile(p => p ? { ...p, is_public: !p.is_public } : p))}
                  style={{ width: 36, height: 20, borderRadius: 10, background: profile.is_public ? 'var(--accent)' : 'var(--surface2)', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: 2, left: profile.is_public ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: profile.is_public ? '#000' : 'var(--muted)', transition: 'left 0.2s' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 40px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 0 }}>
        {(['games', 'following'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '14px 20px', border: 'none', background: 'transparent', color: activeTab === tab ? 'var(--text)' : 'var(--muted)', fontWeight: activeTab === tab ? 600 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s', textTransform: 'capitalize' }}
          >
            {tab === 'games' ? `Games (${total})` : `Following (${followingCount})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '28px 40px', flex: 1 }}>
        {activeTab === 'games' && (
          <>
            {/* Status breakdown */}
            {total > 0 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                {(['unplayed', 'in_progress', 'completed', 'hundred_percent'] as GameStatus[]).map(s => {
                  const count = cabinetGames.filter(g => g.status === s).length
                  if (!count) return null
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[s] }} />
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>{STATUS_LABELS[s]}</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Recent games grid */}
            {total === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
                <div>{isOwn ? 'Your cabinet is empty.' : 'No games yet.'}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                {cabinetGames.slice(0, 18).map(game => (
                  <div key={game.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {game.cover
                      ? <img src={game.cover} alt={game.title} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', aspectRatio: '3/4', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎮</div>
                    }
                    <div style={{ position: 'absolute', top: 5, left: 5, background: STATUS_COLORS[game.status], color: game.status === 'unplayed' ? '#fff' : '#000', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
                      {STATUS_LABELS[game.status]}
                    </div>
                    {game.rating && (
                      <div style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.8)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 3, fontFamily: 'Bebas Neue' }}>
                        {game.rating}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'following' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 500 }}>
            {followingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div>{isOwn ? "You're not following anyone yet." : 'Not following anyone.'}</div>
              </div>
            ) : (
              followingList.map(p => (
                <FollowCard key={p.id} profile={p} onViewCabinet={onViewCabinet} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FollowCard({ profile, onViewCabinet }: { profile: Profile; onViewCabinet?: (userId: string, username: string) => void }) {
  const initial = (profile.display_name || profile.username)[0].toUpperCase()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 18, color: '#000', flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.display_name || profile.username}</div>
        <div style={{ color: 'var(--muted)', fontSize: 12 }}>@{profile.username}</div>
      </div>
      {onViewCabinet && (
        <SmallBtn label="View Cabinet" onClick={() => onViewCabinet(profile.id, profile.username)} />
      )}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 1, color: accent ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function SmallBtn({ label, onClick, accent }: { label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 12px', borderRadius: 7, border: accent ? 'none' : '1px solid var(--border)', background: accent ? 'var(--accent)' : 'transparent', color: accent ? '#000' : 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
      onMouseEnter={e => { if (!accent) e.currentTarget.style.background = 'var(--surface2)' }}
      onMouseLeave={e => { if (!accent) e.currentTarget.style.background = 'transparent' }}
    >
      {label}
    </button>
  )
}