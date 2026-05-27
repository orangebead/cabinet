import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useCabinetStore, STATUSES, STATUS_LABELS, STATUS_COLORS } from '../../store/cabinetStore'
import { fetchGameDetails } from '../../lib/gameDetailsCache'
import type { CabinetGame, GameList, GameDetails } from '../../types'

export function GameModal({ game, onClose }: { game: CabinetGame; onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [details, setDetails] = useState<GameDetails | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(game.status)
  const [pendingRating, setPendingRating] = useState(game.rating)
  const [pendingReview, setPendingReview] = useState(game.review ?? '')
  const [dirty, setDirty] = useState(false)

  const { updateStatus, updateRating, updateReview, removeGame, moveToList } = useCabinetStore()

  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])
  useEffect(() => {
    if (!game.rawg_id) return
    fetchGameDetails(game.rawg_id).then(setDetails)
  }, [game.rawg_id])

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setDirty(true) }

  const close = () => { setMounted(false); setTimeout(onClose, 260) }

  const confirm = () => {
    updateStatus(game.id, pendingStatus)
    updateRating(game.id, pendingRating)
    updateReview(game.id, pendingReview || null)
    setDirty(false)
    close()
  }

  const publisher = details?.publishers?.[0]?.name
  const year = details?.released?.split('-')[0]
  const otherLists: GameList[] = (['cabinet', 'backlog', 'wishlist'] as GameList[]).filter(l => l !== game.list)

  const listStyles: Record<GameList, { bg: string; color: string; border: string; icon: string }> = {
    cabinet: { bg: 'var(--surface2)', color: 'var(--text)', border: 'var(--border)', icon: '🗃️' },
    backlog: { bg: '#1a2a3f', color: '#60a5fa', border: '#2a4a6f', icon: '📋' },
    wishlist: { bg: '#2a1a3f', color: '#c084fc', border: '#4a2a6f', icon: '✨' },
  }

  return (
    <>
      <style>{`
        .review-markdown { color: var(--text); font-size: 14px; line-height: 1.7; }
        .review-markdown p { margin: 0 0 10px; }
        .review-markdown strong { color: var(--accent); }
        .review-markdown em { color: var(--muted); font-style: italic; }
        .review-markdown h1, .review-markdown h2, .review-markdown h3 { font-family: 'Bebas Neue'; letter-spacing: 1px; color: var(--text); margin: 12px 0 6px; }
        .review-markdown ul, .review-markdown ol { padding-left: 20px; margin: 0 0 10px; }
        .review-markdown li { margin-bottom: 4px; }
        .review-markdown blockquote { border-left: 3px solid var(--accent); padding-left: 12px; color: var(--muted); margin: 10px 0; }
        .review-markdown hr { border: none; border-top: 1px solid var(--border); margin: 14px 0; }
        .review-markdown code { background: var(--surface2); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
      `}</style>

      <div
        onClick={close}
        style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: mounted ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)', backdropFilter: mounted ? 'blur(6px)' : 'blur(0px)', transition: 'background 0.25s ease, backdrop-filter 0.25s ease' }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.7)', transform: mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)', opacity: mounted ? 1 : 0, transition: 'transform 0.26s cubic-bezier(0.34,1.3,0.64,1), opacity 0.22s ease', display: 'flex', flexDirection: 'column' }}
        >
          {/* Hero */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {game.cover
              ? <img src={game.cover} alt={game.title} style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: '20px 20px 0 0', display: 'block' }} />
              : <div style={{ width: '100%', height: 260, background: 'var(--surface2)', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🎮</div>
            }
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface) 0%, rgba(0,0,0,0.1) 60%)', borderRadius: '20px 20px 0 0' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 28, right: 60 }}>
              <h2 style={{ margin: '0 0 6px', fontFamily: 'Bebas Neue', fontSize: 34, letterSpacing: 1.5, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.8)', lineHeight: 1 }}>{game.title}</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {publisher && <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>{publisher}</span>}
                {publisher && year && <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>}
                {year && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{year}</span>}
                {!details && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, fontStyle: 'italic' }}>Loading...</span>}
              </div>
            </div>
            <button onClick={close} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Status */}
            <Section label="STATUS">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => markDirty(setPendingStatus)(s)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: pendingStatus === s ? STATUS_COLORS[s] : 'var(--surface2)', color: pendingStatus === s ? (s === 'unplayed' ? '#fff' : '#000') : 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', transform: pendingStatus === s ? 'scale(1.05)' : 'scale(1)', boxShadow: pendingStatus === s ? `0 4px 16px ${STATUS_COLORS[s]}55` : 'none' }}>
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </Section>

            {/* Rating */}
            <Section label="RATING">
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => markDirty(setPendingRating)(pendingRating === n ? null : n)} style={{ width: 38, height: 38, borderRadius: 8, border: 'none', background: (pendingRating ?? 0) >= n ? 'var(--accent)' : 'var(--surface2)', color: (pendingRating ?? 0) >= n ? '#000' : 'var(--muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.12s', transform: (pendingRating ?? 0) >= n ? 'scale(1.1)' : 'scale(1)' }}>
                    {n}
                  </button>
                ))}
                {pendingRating && <span style={{ marginLeft: 8, fontFamily: 'Bebas Neue', fontSize: 28, color: 'var(--accent)', letterSpacing: 1 }}>{pendingRating}/10</span>}
              </div>
            </Section>

            {/* Review */}
            <Section label={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>REVIEW</span>
                <div onClick={() => setEditMode(e => !e)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ fontSize: 11, color: !editMode ? 'var(--text)' : 'var(--muted)', fontWeight: !editMode ? 600 : 400, transition: 'color 0.2s' }}>View</span>
                  <div style={{ width: 40, height: 22, borderRadius: 11, background: editMode ? 'var(--accent)' : 'var(--surface2)', border: '1px solid var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 3, left: editMode ? 20 : 3, width: 14, height: 14, borderRadius: '50%', background: editMode ? '#000' : 'var(--muted)', transition: 'left 0.2s ease, background 0.2s' }} />
                  </div>
                  <span style={{ fontSize: 11, color: editMode ? 'var(--text)' : 'var(--muted)', fontWeight: editMode ? 600 : 400, transition: 'color 0.2s' }}>Edit</span>
                </div>
              </div>
            }>
              {editMode ? (
                <div>
                  <textarea value={pendingReview} onChange={e => { setPendingReview(e.target.value); setDirty(true) }} placeholder={'Write your review in Markdown...\n\n**Bold**, *italic*, ## Headings, > Blockquotes'} style={{ width: '100%', minHeight: 140, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 13, padding: '12px 14px', outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.7, boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => (e.target.style.borderColor = 'var(--muted)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                  <div style={{ marginTop: 6, display: 'flex', gap: 12, color: 'var(--muted)', fontSize: 11 }}>
                    <span>**bold**</span><span>*italic*</span><span>## heading</span><span>&gt; quote</span><span>- list</span>
                  </div>
                </div>
              ) : (
                <div className="review-markdown" style={{ minHeight: 80, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  {pendingReview
                    ? <ReactMarkdown>{pendingReview}</ReactMarkdown>
                    : <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No review yet — toggle Edit to write one.</span>
                  }
                </div>
              )}
            </Section>

            {/* Confirm */}
            <button onClick={confirm} disabled={!dirty} style={{ width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none', background: dirty ? 'var(--accent)' : 'var(--surface2)', color: dirty ? '#000' : 'var(--muted)', fontWeight: 700, fontSize: 14, cursor: dirty ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', boxShadow: dirty ? '0 4px 20px rgba(232,255,71,0.25)' : 'none' }}>
              {dirty ? '✓ Confirm Changes' : 'No changes'}
            </button>

            {/* Move + Remove */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 4, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
              {otherLists.map(l => {
                const s = listStyles[l]
                return (
                  <button key={l} onClick={() => { moveToList(game.id, l); close() }} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, border: `1px solid ${s.border}`, background: s.bg, color: s.color, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'filter 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')} onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}>
                    Move to {l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                )
              })}
              <button onClick={() => { removeGame(game.id); close() }} style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: '#3f1a1a', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }} onMouseEnter={e => (e.currentTarget.style.background = '#5a2020')} onMouseLeave={e => (e.currentTarget.style.background = '#3f1a1a')}>
                Remove
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

function Section({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  )
}