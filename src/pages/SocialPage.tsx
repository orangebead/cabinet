import { useState, useEffect } from 'react'
import { useProfileStore } from '../store/profileStore'
import { useAuthStore } from '../store/authStore'
import { STATUS_LABELS } from '../store/cabinetStore'
import type { Profile, FeedItem } from '../types'

interface Props {
  onViewProfile: (username: string) => void
  onViewCabinet: (userId: string, username: string) => void
}

export function SocialPage({ onViewProfile, onViewCabinet }: Props) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [following, setFollowing] = useState<Profile[]>([])
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [followStates, setFollowStates] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<'feed' | 'following'>('feed')

  const { user } = useAuthStore()
  const { searchProfiles, getFollowing, isFollowing, follow, unfollow, getProfileGames } = useProfileStore()

  useEffect(() => { if (user) loadFollowingAndFeed() }, [user])

  const loadFollowingAndFeed = async () => {
    if (!user) return
    setLoadingFeed(true)
    const followingList = await getFollowing(user.id)
    setFollowing(followingList)

    // build follow states
    const states: Record<string, boolean> = {}
    followingList.forEach(p => { states[p.id] = true })
    setFollowStates(states)

    // build feed from following list
    const feedItems: FeedItem[] = []
    await Promise.all(followingList.map(async (profile) => {
      const games = await getProfileGames(profile.id)
      games.slice(0, 5).forEach(game => {
        if (game.review) {
          feedItems.push({
            id: `review-${game.id}`,
            user_id: profile.id,
            profile,
            type: 'review_written',
            game_title: game.title,
            game_cover: game.cover,
            meta: 'wrote a review',
            created_at: game.updated_at,
          })
        }
        if (game.rating) {
          feedItems.push({
            id: `rating-${game.id}`,
            user_id: profile.id,
            profile,
            type: 'rating_given',
            game_title: game.title,
            game_cover: game.cover,
            meta: `rated it ${game.rating}/10`,
            created_at: game.updated_at,
          })
        }
        if (game.status !== 'unplayed') {
          feedItems.push({
            id: `status-${game.id}`,
            user_id: profile.id,
            profile,
            type: 'status_changed',
            game_title: game.title,
            game_cover: game.cover,
            meta: `marked as ${STATUS_LABELS[game.status]}`,
            created_at: game.updated_at,
          })
        }
        feedItems.push({
          id: `added-${game.id}`,
          user_id: profile.id,
          profile,
          type: 'game_added',
          game_title: game.title,
          game_cover: game.cover,
          meta: 'added to cabinet',
          created_at: game.added_at,
        })
      })
    }))

    feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setFeed(feedItems.slice(0, 40))
    setLoadingFeed(false)
  }

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    const results = await searchProfiles(q)
    const filtered = results.filter(p => p.id !== user?.id)

    // check follow states for results not already in following
    const newStates = { ...followStates }
    await Promise.all(filtered.map(async p => {
      if (newStates[p.id] === undefined && user) {
        newStates[p.id] = await isFollowing(user.id, p.id)
      }
    }))
    setFollowStates(newStates)
    setSearchResults(filtered)
    setSearching(false)
  }

  const toggleFollow = async (profile: Profile) => {
    if (!user) return
    const currently = followStates[profile.id]
    setFollowStates(prev => ({ ...prev, [profile.id]: !currently }))
    if (currently) {
      await unfollow(user.id, profile.id)
      setFollowing(prev => prev.filter(p => p.id !== profile.id))
    } else {
      await follow(user.id, profile.id)
      setFollowing(prev => [...prev, profile])
    }
  }

  const typeIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'game_added': return '➕'
      case 'status_changed': return '🔄'
      case 'review_written': return '✍️'
      case 'rating_given': return '⭐'
    }
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '28px 32px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 2, lineHeight: 1 }}>Social</h1>
            <p style={{ margin: '4px 0 16px', color: 'var(--muted)', fontSize: 13 }}>See what your friends are playing</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {(['feed', 'following'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 20px', border: 'none', background: 'transparent', color: activeTab === tab ? 'var(--text)' : 'var(--muted)', fontWeight: activeTab === tab ? 600 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.15s', textTransform: 'capitalize' }}>
              {tab === 'feed' ? 'Activity Feed' : `Following (${following.length})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px', flex: 1 }}>
        {/* Search — always visible */}
        <div style={{ position: 'relative', maxWidth: 440, marginBottom: 28 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 15 }}>🔍</span>
          <input
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Find people by username..."
            style={{ width: '100%', padding: '11px 14px 11px 40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          {searching && <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 12 }}>...</span>}
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>SEARCH RESULTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 540 }}>
              {searchResults.map(p => (
                <PersonCard
                  key={p.id}
                  profile={p}
                  isFollowing={followStates[p.id] ?? false}
                  onToggleFollow={() => toggleFollow(p)}
                  onViewProfile={() => onViewProfile(p.username)}
                  onViewCabinet={p.is_public ? () => onViewCabinet(p.id, p.username) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Activity feed tab */}
        {activeTab === 'feed' && !searchResults.length && (
          <>
            {loadingFeed ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 3, opacity: 0.4 }}>Loading feed...</div>
              </div>
            ) : feed.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>👥</div>
                <div style={{ fontSize: 15, marginBottom: 6 }}>Your feed is empty</div>
                <div style={{ fontSize: 13 }}>Search for friends above and follow them to see their activity here</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 580 }}>
                {feed.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 14, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, transition: 'border-color 0.15s', cursor: 'pointer' }}
                    onClick={() => onViewProfile(item.profile.username)}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--muted)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {/* Avatar */}
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 17, color: '#000', flexShrink: 0 }}>
                      {(item.profile.display_name || item.profile.username)[0].toUpperCase()}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600 }}>@{item.profile.username}</span>
                        {' '}
                        <span style={{ color: 'var(--muted)' }}>{item.meta}</span>
                        {' '}
                        <span style={{ fontWeight: 500 }}>{item.game_title}</span>
                        {' '}
                        <span style={{ fontSize: 15 }}>{typeIcon(item.type)}</span>
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>{timeAgo(item.created_at)}</div>
                    </div>

                    {/* Game cover */}
                    {item.game_cover && (
                      <img src={item.game_cover} alt={item.game_title} style={{ width: 42, height: 28, objectFit: 'cover', borderRadius: 5, flexShrink: 0, alignSelf: 'center' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Following tab */}
        {activeTab === 'following' && !searchResults.length && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 540 }}>
            {following.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>👥</div>
                <div style={{ fontSize: 15 }}>Not following anyone yet</div>
              </div>
            ) : (
              following.map(p => (
                <PersonCard
                  key={p.id}
                  profile={p}
                  isFollowing={true}
                  onToggleFollow={() => toggleFollow(p)}
                  onViewProfile={() => onViewProfile(p.username)}
                  onViewCabinet={p.is_public ? () => onViewCabinet(p.id, p.username) : undefined}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function PersonCard({ profile, isFollowing, onToggleFollow, onViewProfile, onViewCabinet }: {
  profile: Profile
  isFollowing: boolean
  onToggleFollow: () => void
  onViewProfile: () => void
  onViewCabinet?: () => void
}) {
  const initial = (profile.display_name || profile.username)[0].toUpperCase()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, transition: 'border-color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--muted)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 19, color: '#000', flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onViewProfile}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.display_name || profile.username}</div>
        <div style={{ color: 'var(--muted)', fontSize: 12 }}>@{profile.username}{!profile.is_public ? ' · Private' : ''}</div>
      </div>
      <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
        {onViewCabinet && (
          <button onClick={onViewCabinet} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
          >Cabinet</button>
        )}
        <button onClick={onToggleFollow} style={{ padding: '6px 14px', borderRadius: 7, border: isFollowing ? '1px solid var(--border)' : 'none', background: isFollowing ? 'transparent' : 'var(--accent)', color: isFollowing ? 'var(--muted)' : '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => { if (isFollowing) { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171' } }}
          onMouseLeave={e => { if (isFollowing) { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' } }}
        >{isFollowing ? 'Unfollow' : 'Follow'}</button>
      </div>
    </div>
  )
}