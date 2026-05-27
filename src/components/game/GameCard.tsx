import { GameModal } from './GameModal'
import { STATUS_LABELS, STATUS_COLORS } from '../../store/cabinetStore'
import type { CabinetGame } from '../../types'
import { useState } from 'react'

interface Props { game: CabinetGame }

export function GameCard({ game }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(-4px)'
          el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)'
          el.style.borderColor = 'var(--muted)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'none'
          el.style.borderColor = 'var(--border)'
        }}
      >
        <div style={{ position: 'relative' }}>
          {game.cover
            ? <img src={game.cover} alt={game.title} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', aspectRatio: '3/4', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎮</div>
          }
          <div style={{ position: 'absolute', top: 8, left: 8, background: STATUS_COLORS[game.status], color: game.status === 'unplayed' ? 'var(--text)' : '#000', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: '3px 8px', borderRadius: 4 }}>
            {STATUS_LABELS[game.status]}
          </div>
          {game.rating && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.8)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: 'Bebas Neue', letterSpacing: 1 }}>
              {game.rating}/10
            </div>
          )}
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.18s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.4)'; (e.currentTarget.firstChild as HTMLElement).style.opacity = '1' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; (e.currentTarget.firstChild as HTMLElement).style.opacity = '0' }}
          >
            <span style={{ opacity: 0, transition: 'opacity 0.18s', pointerEvents: 'none' }}>✏️</span>
          </div>
        </div>

        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.title}</div>
          {/* {game.review && (
            <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontStyle: 'italic' }}>"{game.review}"</div>
          )} */}
        </div>
      </div>

      {open && <GameModal game={game} onClose={() => setOpen(false)} />}
    </>
  )
}

function Section({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  )
}