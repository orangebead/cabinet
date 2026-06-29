import { useState, useEffect } from 'react'
import { useProfileStore } from '../store/profileStore'
import { useIsMobile } from '../hooks/useIsMobile'
import { STATUS_COLORS, STATUS_LABELS } from '../store/cabinetStore'
import { GameModal } from '../components/game/GameModal'
import type { CabinetGame, GameStatus } from '../types'

interface Props { userId: string; username: string; onBack: () => void }

const STATUS_ORDER: GameStatus[] = ['in_progress', 'completed', 'hundred_percent', 'unplayed']

export function FriendCabinetPage({ userId, username, onBack }: Props) {
  const [games, setGames]     = useState<CabinetGame[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CabinetGame | null>(null)
  const { getProfileGames } = useProfileStore()
  const isMobile = useIsMobile()

  useEffect(() => {
    getProfileGames(userId).then(g => { setGames(g); setLoading(false) })
  }, [userId])

  const cabinet = games.filter(g => g.list === 'cabinet')
  const total   = cabinet.length

  // Stats
  const completed = cabinet.filter(g => g.status === 'completed' || g.status === 'hundred_percent').length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const rated = cabinet.filter(g => g.rating)
  const avgRating = rated.length
    ? (rated.reduce((s, g) => s + g.rating!, 0) / rated.length).toFixed(1)
    : null

  const pad = isMobile ? '20px 16px' : '32px 40px'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{ padding: isMobile ? '20px 16px 0' : '32px 40px 0', borderBottom: '1px solid var(--border)' }}>

        {/* Back + title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', padding: '7px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)' }}
          >← Back</button>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: isMobile ? 26 : 32, letterSpacing: 1.5, lineHeight: 1 }}>
              @{username}'s Cabinet
            </h1>
          </div>
        </div>

        {/* Stats strip */}
        {!loading && (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden', marginBottom: 20,
            }}>
              {[
                { label: 'In Cabinet', value: total },
                { label: 'Completion', value: `${completionPct}%` },
                { label: 'Avg Rating', value: avgRating ?? '—' },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: isMobile ? '14px 8px' : '16px 12px', textAlign: 'center', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: isMobile ? 24 : 28, letterSpacing: 1, color: i === 1 && completionPct === 100 ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 4, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Status bar */}
            {total > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', height: 6, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
                  {STATUS_ORDER.map(s => {
                    const count = cabinet.filter(g => g.status === s).length
                    if (!count) return null
                    return <div key={s} style={{ flex: (count / total) * 100, background: STATUS_COLORS[s], minWidth: 4, borderRadius: 2 }} title={`${STATUS_LABELS[s]}: ${count}`} />
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 8 }}>
                  {STATUS_ORDER.map(s => {
                    const count = cabinet.filter(g => g.status === s).length
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
            )}
          </>
        )}
      </div>

      {/* ── Cabinet grid ── */}
      <div style={{ padding: pad, flex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : cabinet.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
            <div>No games in this cabinet yet.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 100 : 130}px, 1fr))`, gap: 10 }}>
            {cabinet.map(game => (
              <div
                key={game.id}
                onClick={() => setSelected(game)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
              >
                <div style={{ position: 'relative' }}>
                  {game.cover
                    ? <img src={game.cover} alt={game.title} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} loading="lazy" />
                    : <div style={{ width: '100%', aspectRatio: '3/4', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎮</div>
                  }
                  <div style={{ position: 'absolute', top: 7, left: 7, background: STATUS_COLORS[game.status], color: game.status === 'unplayed' ? '#fff' : '#000', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                    {STATUS_LABELS[game.status]}
                  </div>
                  {game.rating && (
                    <div style={{ position: 'absolute', top: 7, right: 7, background: 'rgba(0,0,0,0.8)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, fontFamily: 'Space Grotesk' }}>
                      {game.rating}/10
                    </div>
                  )}
                </div>
                <div style={{ padding: '8px 10px 10px', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                  {game.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <GameModal game={selected} onClose={() => setSelected(null)} readOnly />}
    </div>
  )
}