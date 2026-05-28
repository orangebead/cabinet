import { useState, useEffect } from 'react'
import { useProfileStore } from '../store/profileStore'
import { STATUS_COLORS, STATUS_LABELS } from '../store/cabinetStore'
import { GameModal } from '../components/game/GameModal'
import type { CabinetGame } from '../types'

interface Props { userId: string; username: string; onBack: () => void }

export function FriendCabinetPage({ userId, username, onBack }: Props) {
  const [games, setGames] = useState<CabinetGame[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CabinetGame | null>(null)
  const { getProfileGames } = useProfileStore()

  useEffect(() => {
    getProfileGames(userId).then(g => { setGames(g); setLoading(false) })
  }, [userId])

  const cabinet = games.filter(g => g.list === 'cabinet')

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', cursor: 'pointer', padding: '7px 12px', fontSize: 12, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)' }}
        >← Back</button>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Bebas Neue', fontSize: 36, letterSpacing: 2, lineHeight: 1 }}>@{username}'s Cabinet</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>{cabinet.length} games</p>
        </div>
      </div>

      <div style={{ padding: '28px 32px', flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 3, opacity: 0.4 }}>Loading...</div>
          </div>
        ) : cabinet.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎮</div>
            <div>No games in this cabinet yet.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {cabinet.map(game => (
              <div
                key={game.id}
                onClick={() => setSelected(game)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
              >
                <div style={{ position: 'relative' }}>
                  {game.cover
                    ? <img src={game.cover} alt={game.title} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', aspectRatio: '3/4', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🎮</div>
                  }
                  <div style={{ position: 'absolute', top: 8, left: 8, background: STATUS_COLORS[game.status], color: game.status === 'unplayed' ? '#fff' : '#000', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                    {STATUS_LABELS[game.status]}
                  </div>
                  {game.rating && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.8)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'Bebas Neue' }}>
                      {game.rating}/10
                    </div>
                  )}
                </div>
                <div style={{ padding: '10px 12px 12px', fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {game.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Read-only modal — no edit controls */}
      {selected && <GameModal game={selected} onClose={() => setSelected(null)} readOnly />}
    </div>
  )
}