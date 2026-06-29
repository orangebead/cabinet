import { useState } from 'react'
import { STATUS_LABELS, STATUS_COLORS } from '../../store/cabinetStore'
import { GameModal } from './GameModal'
import type { CabinetGame } from '../../types'

interface Props { games: CabinetGame[] }

export function ListView({ games }: Props) {
  const [selected, setSelected] = useState<CabinetGame | null>(null)

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 140px 100px 80px', gap: 12, padding: '6px 16px', marginBottom: 4 }}>
          {['Game', 'Status', 'Rating', 'Added'].map(h => (
            <span key={h} style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 700, letterSpacing: 0.1, textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {games.map((game, i) => (
          <ListRow key={game.id} game={game} index={i} onClick={() => setSelected(game)} />
        ))}
      </div>

      {selected && <GameModal game={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function ListRow({ game, index, onClick }: { game: CabinetGame; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 140px 100px 80px',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 10,
        background: hovered ? 'var(--surface)' : index % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
        border: `1px solid ${hovered ? 'var(--border)' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.12s',
        alignItems: 'center',
      }}
    >
      {/* Game name + cover thumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {game.cover
          ? <img src={game.cover} alt={game.title} style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 5, flexShrink: 0, background: 'var(--surface2)' }} />
          : <div style={{ width: 48, height: 32, borderRadius: 5, background: 'var(--surface2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎮</div>
        }
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.title}</div>
          {game.review && (
            <div style={{ color: 'var(--muted)', fontSize: 11, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
              Has review
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div>
        <span style={{ background: STATUS_COLORS[game.status], color: game.status === 'unplayed' ? 'var(--text)' : '#000', fontSize: 10, fontWeight: 700, letterSpacing: 0.4, padding: '3px 9px', borderRadius: 4, whiteSpace: 'nowrap' }}>
          {STATUS_LABELS[game.status]}
        </span>
      </div>

      {/* Rating */}
      <div>
        {game.rating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ height: 4, width: 60, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(game.rating / 10) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: 15, color: 'var(--accent)', letterSpacing: 0.1 }}>{game.rating}</span>
          </div>
        ) : (
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
        )}
      </div>

      {/* Date added */}
      <div style={{ color: 'var(--muted)', fontSize: 12 }}>
        {new Date(game.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </div>
    </div>
  )
}