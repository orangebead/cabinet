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

// ── Shared stat helpers ────────────────────────────────────────────────────────
function deriveStats(games: CabinetGame[]) {
  const cabinet = games.filter(g => g.list === 'cabinet')
  const backlog  = games.filter(g => g.list === 'backlog').length
  const wishlist = games.filter(g => g.list === 'wishlist').length
  const total    = cabinet.length
  const completed = cabinet.filter(g => g.status === 'completed' || g.status === 'hundred_percent').length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const rated    = cabinet.filter(g => g.rating)
  const avgRating = rated.length
    ? (rated.reduce((s, g) => s + g.rating!, 0) / rated.length).toFixed(1)
    : null
  return { cabinet, total, backlog, wishlist, completed, completionPct, avgRating }
}

// ── Status bar — coloured segmented bar ──────────────────────────────────────
const STATUS_ORDER: GameStatus[] = ['in_progress', 'completed', 'hundred_percent', 'unplayed']

function StatusBar({ games }: { games: CabinetGame[] }) {
  const total = games.length
  if (!total) return null
  return (
    <div>
      <div style={{ display: 'flex', height: 6, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
        {STATUS_ORDER.map(s => {
          const count = games.filter(g => g.status === s).length
          if (!count) return null
          const pct = (count / total) * 100
          return <div key={s} style={{ flex: pct, background: STATUS_COLORS[s], minWidth: 4, borderRadius: 2 }} title={`${STATUS_LABELS[s]}: ${count}`} />
        })}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
        {STATUS_ORDER.map(s => {
          const count = games.filter(g => g.status === s).length
          if (!count) return null
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: STATUS_COLORS[s], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{STATUS_LABELS[s]}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Profile hero — shared between own + friend views ─────────────────────────
function ProfileHero({
  profile, stats, isMobile, isOwn, following,
  onFollow, onViewCabinet,
  editingBio, bioText, setBioText, onSaveBio, onCancelBio, onStartEditBio,
  onTogglePublic,
}: {
  profile: Profile
  stats: ReturnType<typeof deriveStats>
  isMobile: boolean
  isOwn: boolean
  following?: boolean
  onFollow?: () => void
  onViewCabinet?: () => void
  editingBio?: boolean
  bioText?: string
  setBioText?: (s: string) => void
  onSaveBio?: () => void
  onCancelBio?: () => void
  onStartEditBio?: () => void
  onTogglePublic?: () => void
}) {
  const initial = (profile.display_name || profile.username)[0].toUpperCase()
  const pad = isMobile ? '20px 16px 0' : '32px 40px 0'

  return (
    <div style={{ padding: pad, borderBottom: '1px solid var(--border)' }}>

      {/* ── Top row: avatar + name + follow ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>

        {/* Avatar */}
        <div style={{
          width: isMobile ? 60 : 72, height: isMobile ? 60 : 72,
          borderRadius: '50%', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Bebas Neue', fontSize: isMobile ? 28 : 34,
          color: '#000', flexShrink: 0,
        }}>
          {initial}
        </div>

        {/* Name block */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: isMobile ? 28 : 34, letterSpacing: 1, lineHeight: 1 }}>
              {profile.display_name || profile.username}
            </h1>
            {!profile.is_public && (
              <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>
                Private
              </span>
            )}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 3 }}>@{profile.username}</div>
        </div>

        {/* Follow button — top-right, friend profiles only */}
        {!isOwn && onFollow && (
          <button
            onClick={onFollow}
            style={{ padding: '8px 18px', borderRadius: 8, border: following ? '1px solid var(--border)' : 'none', background: following ? 'transparent' : 'var(--accent)', color: following ? 'var(--muted)' : '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={e => { if (following) { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171' } }}
            onMouseLeave={e => { if (following) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' } }}
          >
            {following ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      {/* ── Bio ── */}
      <div style={{ marginBottom: 20 }}>
        {isOwn && editingBio ? (
          <div>
            <textarea
              value={bioText}
              onChange={e => setBioText?.(e.target.value)}
              placeholder="Write a short bio…"
              rows={3}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '10px 12px', outline: 'none', resize: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={onSaveBio} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Save</button>
              <button onClick={onCancelBio} style={{ padding: '7px 16px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: profile.bio ? 'var(--text)' : 'var(--muted)', lineHeight: 1.6, flex: 1, fontStyle: profile.bio ? 'normal' : 'italic' }}>
              {profile.bio || (isOwn ? 'No bio yet.' : 'No bio.')}
            </p>
            {isOwn && (
              <button onClick={onStartEditBio} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
              >Edit</button>
            )}
          </div>
        )}
      </div>

      {/* ── Stats strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${isOwn ? 4 : 3}, 1fr)`,
        borderTop: '1px solid var(--border)',
        borderLeft: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        {[
          { label: 'In Cabinet', value: stats.total },
          { label: 'Completion', value: `${stats.completionPct}%` },
          { label: 'Avg Rating', value: stats.avgRating ?? '—' },
          ...(isOwn ? [{ label: 'Backlog', value: stats.backlog }] : []),
        ].map((s, i) => (
          <div key={s.label} style={{ padding: isMobile ? '14px 8px' : '16px 12px', textAlign: 'center', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: isMobile ? 24 : 28, letterSpacing: 1, color: i === 1 && stats.completionPct === 100 ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 4, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Status bar ── */}
      {stats.total > 0 && (
        <div style={{ marginBottom: 20 }}>
          <StatusBar games={stats.cabinet} />
        </div>
      )}

      {/* ── View Cabinet — full width, below stats, friend profiles only ── */}
      {!isOwn && profile.is_public && onViewCabinet && (
        <button
          onClick={onViewCabinet}
          style={{ width: '100%', padding: '11px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s', marginBottom: 20 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          View Cabinet →
        </button>
      )}

      {/* ── Own profile: public toggle ── */}
      {isOwn && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16 }}>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>Public profile</span>
          <div
            onClick={onTogglePublic}
            style={{ width: 36, height: 20, borderRadius: 10, background: profile.is_public ? 'var(--accent)' : 'var(--surface2)', border: '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            <div style={{ position: 'absolute', top: 2, left: profile.is_public ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: profile.is_public ? '#000' : 'var(--muted)', transition: 'left 0.2s' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Cabinet grid ──────────────────────────────────────────────────────────────
function CabinetGrid({ games, isMobile }: { games: CabinetGame[]; isMobile: boolean }) {
  if (games.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🎮</div>
      <div style={{ fontSize: 14 }}>No games yet.</div>
    </div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(isMobile ? 90px : 110px, 1fr))'.replace('isMobile ? 90px : 110px', isMobile ? '90px' : '110px'), gap: 8 }}>
      {games.map(game => (
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
  )
}

// ── ProfilePage ───────────────────────────────────────────────────────────────
export function ProfilePage({ username, onViewCabinet }: Props) {
  const { user } = useAuthStore()
  const {
    profile: ownProfile, getProfileByUsername, getProfileGames,
    getFollowerCount, getFollowingCount, isFollowing, follow, unfollow,
    updateProfile, getFollowing,
  } = useProfileStore()
  const isMobile = useIsMobile()

  const [profile, setProfile]           = useState<Profile | null>(null)
  const [games, setGames]               = useState<CabinetGame[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [following, setFollowing]       = useState(false)
  const [followingList, setFollowingList] = useState<Profile[]>([])
  const [loading, setLoading]           = useState(true)
  const [editingBio, setEditingBio]     = useState(false)
  const [bioText, setBioText]           = useState('')
  const [activeTab, setActiveTab]       = useState<'games' | 'following'>('games')

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
    if (following) { await unfollow(user.id, profile.id); setFollowing(false); setFollowerCount(c => c - 1) }
    else           { await follow(user.id, profile.id);   setFollowing(true);  setFollowerCount(c => c + 1) }
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

  const stats = deriveStats(games)
  const pad = isMobile ? '20px 16px' : '32px 40px'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <ProfileHero
        profile={profile}
        stats={stats}
        isMobile={isMobile}
        isOwn={isOwn}
        following={following}
        onFollow={handleFollow}
        onViewCabinet={onViewCabinet ? () => onViewCabinet(profile.id, profile.username) : undefined}
        editingBio={editingBio}
        bioText={bioText}
        setBioText={setBioText}
        onSaveBio={saveBio}
        onCancelBio={() => { setBioText(profile.bio ?? ''); setEditingBio(false) }}
        onStartEditBio={() => setEditingBio(true)}
        onTogglePublic={() => user && updateProfile(user.id, { is_public: !profile.is_public }).then(() => setProfile(p => p ? { ...p, is_public: !p.is_public } : p))}
      />

      {/* ── Tabs ── */}
      <div style={{ borderBottom: '1px solid var(--border)', display: 'flex', padding: '0 16px' }}>
        {(['games', 'following'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '14px 20px', border: 'none', background: 'transparent', color: activeTab === tab ? 'var(--text)' : 'var(--muted)', fontWeight: activeTab === tab ? 700 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s' }}
          >
            {tab === 'games' ? `Games (${stats.total})` : `Following (${followingCount})`}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ padding: pad, flex: 1 }}>
        {activeTab === 'games' && <CabinetGrid games={stats.cabinet} isMobile={isMobile} />}

        {activeTab === 'following' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 500 }}>
            {followingList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
                <div style={{ fontSize: 14 }}>{isOwn ? "You're not following anyone yet." : 'Not following anyone.'}</div>
              </div>
            ) : followingList.map(p => {
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
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── FriendCabinetPage — same hero, different content ─────────────────────────
// Re-exported here so both pages share the ProfileHero component.
// If you keep FriendCabinetPage.tsx as a separate file, import ProfileHero from a shared file.

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