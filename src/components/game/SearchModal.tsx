import { useState, useRef, useEffect } from 'react'
import { useGameSearch } from '../../hooks/useGameSearch'
import { useCabinetStore } from '../../store/cabinetStore'
import type { GameList, RawgGame } from '../../types'

interface Props { onClose: () => void; defaultList?: GameList }

interface Props {
  onClose: () => void
  defaultList?: GameList
  userId: string        // ← add this
}

export function SearchModal({ onClose, defaultList = 'cabinet', userId }: Props) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [added, setAdded] = useState<Set<number>>(new Set())
  const { results, loading } = useGameSearch(debouncedQuery)
  const addGame = useCabinetStore(s => s.addGame)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // debounce the query before passing to useGameSearch
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const close = () => {
    setMounted(false)
    setTimeout(onClose, 220)
  }

  const handleAdd = (game: RawgGame, list: GameList) => {
    addGame(game, list, userId)   // ← pass userId
    setAdded(prev => new Set(prev).add(game.id))
  }

  const lists: { id: GameList; label: string; primary?: boolean }[] = [
    { id: 'cabinet', label: 'Cabinet', primary: true },
    { id: 'backlog', label: 'Backlog' },
    { id: 'wishlist', label: 'Wishlist' },
  ]

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh',
        background: mounted ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)',
        backdropFilter: mounted ? 'blur(6px)' : 'blur(0px)',
        transition: 'background 0.22s ease, backdrop-filter 0.22s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 580,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 0.24s cubic-bezier(0.34,1.3,0.64,1), opacity 0.2s ease',
        }}
      >
        {/* Search input */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <span style={{ color: 'var(--muted)', fontSize: 18, flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search 500k+ games..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 16, fontFamily: 'DM Sans, sans-serif',
            }}
          />
          {loading && (
            <span style={{ color: 'var(--muted)', fontSize: 12, flexShrink: 0 }}>Searching...</span>
          )}
          <button
            onClick={close}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, padding: 4, flexShrink: 0, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {query.length < 2 && (
            <div style={{ padding: '48px 20px', color: 'var(--muted)', textAlign: 'center', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎮</div>
              Start typing to search games
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div style={{ padding: '48px 20px', color: 'var(--muted)', textAlign: 'center', fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🤷</div>
              No games found for "{query}"
            </div>
          )}

          {results.map(game => {
            const isAdded = added.has(game.id)
            return (
              <div
                key={game.id}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Cover thumbnail */}
                {game.background_image
                  ? <img src={game.background_image} alt={game.name} style={{ width: 56, height: 38, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: 'var(--surface2)' }} />
                  : <div style={{ width: 56, height: 38, background: 'var(--surface2)', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎮</div>
                }

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>
                    {game.name}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{game.released?.split('-')[0] ?? '—'}</span>
                    {game.metacritic && (
                      <>
                        <span style={{ color: 'var(--border)' }}>·</span>
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>MC {game.metacritic}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Add buttons */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {isAdded ? (
                    <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, padding: '5px 10px' }}>✓ Added</span>
                  ) : (
                    lists.map(l => (
                      <button
                        key={l.id}
                        onClick={() => handleAdd(game, l.id)}
                        style={{
                          padding: '5px 11px',
                          borderRadius: 6,
                          border: l.primary ? 'none' : '1px solid var(--border)',
                          background: l.primary ? 'var(--accent)' : 'transparent',
                          color: l.primary ? '#000' : 'var(--muted)',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'DM Sans, sans-serif',
                          transition: 'all 0.1s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                          if (!l.primary) e.currentTarget.style.background = 'var(--surface2)'
                        }}
                        onMouseLeave={e => {
                          if (!l.primary) e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        {l.label}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>{results.length} results</span>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>Press <kbd style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>Esc</kbd> to close</span>
          </div>
        )}
      </div>
    </div>
  )
}