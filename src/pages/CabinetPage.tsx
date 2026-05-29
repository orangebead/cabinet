import { useState } from 'react'
import { useCabinetStore, STATUS_LABELS } from '../store/cabinetStore'
import { useAuthStore } from '../store/authStore'
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
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 2, lineHeight: 1 }}>{meta.title}</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>{meta.desc}</p>
        </div>
        <button
          onClick={() => setShowSearch(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}
        >
          + Add Game
        </button>
      </div>

      <div style={{ padding: '24px 32px', flex: 1 }}>
        {activeList === 'cabinet' && <ProgressBar />}

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter by name..."
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '8px 12px', outline: 'none', width: 180, fontFamily: 'DM Sans, sans-serif' }}
          />

          <div style={{ display: 'flex', gap: 4 }}>
            {(['all', 'unplayed', 'in_progress', 'completed', 'hundred_percent'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '7px 12px', borderRadius: 7, border: 'none', background: filterStatus === s ? 'var(--surface2)' : 'transparent', color: filterStatus === s ? 'var(--text)' : 'var(--muted)', fontSize: 12, fontWeight: filterStatus === s ? 600 : 400, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', outline: filterStatus === s ? '1px solid var(--border)' : 'none' }}>
                {s === 'all' ? 'All' : STATUS_LABELS[s as GameStatus]}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 12, padding: '7px 10px', outline: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              <option value="added_at">Date Added</option>
              <option value="rating">Rating</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>

            <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {(['grid', 'list'] as ViewMode[]).map(mode => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '7px 11px', border: 'none', background: viewMode === mode ? 'var(--surface2)' : 'transparent', color: viewMode === mode ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', fontSize: 15, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {mode === 'grid' ? (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><rect x="0" y="0" width="6" height="6" rx="1" /><rect x="9" y="0" width="6" height="6" rx="1" /><rect x="0" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><rect x="0" y="1" width="15" height="2.5" rx="1" /><rect x="0" y="6.25" width="15" height="2.5" rx="1" /><rect x="0" y="11.5" width="15" height="2.5" rx="1" /></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loadingGames && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 3, opacity: 0.4 }}>Loading...</div>
          </div>
        )}

        {/* Empty state */}
        {!loadingGames && games.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>No games here yet</div>
            <div style={{ fontSize: 13 }}>Click "Add Game" to start building your {activeList}</div>
          </div>
        )}

        {!loadingGames && games.length > 0 && viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {games.map(game => <GameCard key={game.id} game={game} />)}
          </div>
        )}

        {!loadingGames && games.length > 0 && viewMode === 'list' && (
          <ListView games={games} />
        )}
      </div>

      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          defaultList={activeList}
          userId={user!.id}
        />
      )}
    </div>
  )
}