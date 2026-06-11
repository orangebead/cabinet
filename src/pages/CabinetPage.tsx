import { useState } from 'react'
import { useCabinetStore, STATUS_LABELS } from '../store/cabinetStore'
import { useAuthStore } from '../store/authStore'
import { useIsMobile } from '../hooks/useIsMobile'
import { GameCard } from '../components/game/GameCard'
import { ProgressBar } from '../components/game/ProgressBar'
import { SearchModal } from '../components/game/SearchModal'
import { ListView } from '../components/game/ListView'
import type { GameStatus } from '../types'

const LIST_META = {
  cabinet: { title: 'Cabinet', desc: 'Games you own or have played' },
  backlog: { title: 'Backlog', desc: 'Games you plan to play' },
  wishlist: { title: 'Wishlist', desc: 'Games you want to get' },
}

type ViewMode = 'grid' | 'list'

export function CabinetPage() {
  const [showSearch, setShowSearch] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const isMobile = useIsMobile()
  const { user } = useAuthStore()
  const {
    activeList, sortBy, setSortBy, filterStatus, setFilterStatus,
    searchQuery, setSearchQuery, getFilteredGames, loadingGames,
  } = useCabinetStore()

  const games = getFilteredGames()
  const meta = LIST_META[activeList]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '20px 16px 14px' : '28px 32px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: isMobile ? 32 : 40, letterSpacing: 2, lineHeight: 1 }}>{meta.title}</h1>
          {!isMobile && <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>{meta.desc}</p>}
        </div>
        <button
          onClick={() => setShowSearch(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '9px 14px' : '10px 18px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: isMobile ? 12 : 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}
        >
          + {isMobile ? '' : 'Add Game'}
          {isMobile && 'Add'}
        </button>
      </div>

      <div style={{ padding: isMobile ? '16px' : '24px 32px', flex: 1 }}>
        {activeList === 'cabinet' && <ProgressBar />}

        {/* Toolbar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {/* Top row: search + view toggle */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by name..."
              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '8px 10px', outline: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}
            >
              <option value="added_at">Date</option>
              <option value="rating">Rating</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
            <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
              {(['grid', 'list'] as ViewMode[]).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '8px 10px', border: 'none', background: viewMode === mode ? 'var(--surface2)' : 'transparent', color: viewMode === mode ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {mode === 'grid'
                    ? <svg width="14" height="14" viewBox="0 0 15 15" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1" /><rect x="9" y="0" width="6" height="6" rx="1" /><rect x="0" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                    : <svg width="14" height="14" viewBox="0 0 15 15" fill="currentColor"><rect x="0" y="1" width="15" height="2.5" rx="1" /><rect x="0" y="6.25" width="15" height="2.5" rx="1" /><rect x="0" y="11.5" width="15" height="2.5" rx="1" /></svg>
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: status filters — horizontally scrollable on mobile */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch' as any }}>
            {(['all', 'unplayed', 'in_progress', 'completed', 'hundred_percent'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{ padding: '6px 12px', borderRadius: 7, border: 'none', background: filterStatus === s ? 'var(--surface2)' : 'transparent', color: filterStatus === s ? 'var(--text)' : 'var(--muted)', fontSize: 12, fontWeight: filterStatus === s ? 600 : 400, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', outline: filterStatus === s ? '1px solid var(--border)' : 'none', flexShrink: 0, transition: 'all 0.15s' }}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s as GameStatus]}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loadingGames && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 13 }}>Loading your cabinet...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {!loadingGames && games.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No games here yet</div>
            <div style={{ fontSize: 13 }}>Tap "Add" to start building your {activeList}</div>
          </div>
        )}

        {!loadingGames && games.length > 0 && viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: isMobile ? 10 : 14 }}>
            {games.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        )}

        {!loadingGames && games.length > 0 && viewMode === 'list' && (
          <ListView games={games} />
        )}
      </div>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} defaultList={activeList} userId={user!.id} />}
    </div>
  )
}