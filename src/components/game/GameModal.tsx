import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useCabinetStore, STATUSES, STATUS_LABELS, STATUS_COLORS } from '../../store/cabinetStore'
import { fetchGameDetails } from '../../lib/gameDetailsCache'
import type { CabinetGame, GameList, GameDetails } from '../../types'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  FaPlaystation,
  FaXbox,
  FaWindows,
  FaApple,
  FaLinux,
  // FaSteam,       // New
  // FaGooglePlay,  // New
  // FaItchIo,      // New
  // FaGamepad      // Generic fallback for stores without a stable FA icon
} from 'react-icons/fa';
import { BsNintendoSwitch } from 'react-icons/bs';

// ── Store icon helper ──────────────────────────────────────────────────────────
// const STORE_ICONS: Record<string, React.ElementType> = {
//   'steam': FaSteam,
//   'playstation-store': FaPlaystation,
//   'xbox-store': FaXbox,
//   'xbox360': FaXbox,
//   'nintendo': BsNintendoSwitch,
//   'apple-appstore': FaApple,
//   'google-play': FaGooglePlay,
//   'itch.io': FaItchIo,
//   'epic-games': FaGamepad,
//   'gog': FaGamepad,
// }

// ── Platform config ────────────────────────────────────────────────────────────
// Maps RAWG platform slugs to display labels and a simple icon character.
// Extend this map as needed — RAWG slugs are stable identifiers.
const PLATFORM_MAP: Record<string, { label: string; Icon: React.ElementType }> = {
  'playstation4': { label: 'PS4', Icon: FaPlaystation },
  'playstation5': { label: 'PS5', Icon: FaPlaystation },
  'xbox-series-x': { label: 'Series X/S', Icon: FaXbox },
  'pc': { label: 'PC', Icon: FaWindows },
  'nintendo-switch': { label: 'Switch', Icon: BsNintendoSwitch },
  'macos': { label: 'Mac', Icon: FaApple },
  'linux': { label: 'Linux', Icon: FaLinux },
}

// ── Metacritic colour thresholds ───────────────────────────────────────────────
function metacriticStyle(score: number): { bg: string; color: string; border: string } {
  if (score >= 75) return { bg: '#1a2e1a', color: '#4ade80', border: '#2a4a2a' }
  if (score >= 50) return { bg: '#2e2a1a', color: '#facc15', border: '#4a3f1a' }
  return { bg: '#2e1a1a', color: '#f87171', border: '#4a2a2a' }
}



export function GameModal({ game, onClose, readOnly = false }: { game: CabinetGame; onClose: () => void; readOnly?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [details, setDetails] = useState<GameDetails | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(game.status)
  const [pendingRating, setPendingRating] = useState(game.rating)
  const [pendingReview, setPendingReview] = useState(game.review ?? '')
  const [dirty, setDirty] = useState(false)
  const [showAllTags, setShowAllTags] = useState(false)
  const isMobile = useIsMobile()

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
  }

  // ── Derived metadata ─────────────────────────────────────────────────────────
  const developer = details?.developers?.[0]?.name
  const publisher = details?.publishers?.[0]?.name
  const year = details?.released?.split('-')[0]
  const metacritic = details?.metacritic
  const esrb = details?.esrb_rating?.name
  const platforms = details?.platforms?.map((p: any) => p.platform) ?? []
  const tags = details?.tags?.slice(0, showAllTags ? 20 : 5) ?? []
  const totalTags = details?.tags?.length ?? 0
  const stores = details?.stores ?? []

  const otherLists: GameList[] = (['cabinet', 'backlog', 'wishlist'] as GameList[]).filter(l => l !== game.list)
  const listStyles: Record<GameList, { bg: string; color: string; border: string }> = {
    cabinet: { bg: 'var(--surface2)', color: 'var(--text)', border: 'var(--border)' },
    backlog: { bg: '#1a2a3f', color: '#60a5fa', border: '#2a4a6f' },
    wishlist: { bg: '#2a1a3f', color: '#c084fc', border: '#4a2a6f' },
  }

  // ── Shared pill style ────────────────────────────────────────────────────────
  const pillStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 500,
    border: '1px solid var(--border)', color: 'var(--muted)',
    background: 'var(--surface2)', whiteSpace: 'nowrap' as const,
    fontFamily: 'DM Sans, sans-serif',
  }

  // ── Animation styles ─────────────────────────────────────────────────────────
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: isMobile ? 0 : 24,
    background: mounted ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)',
    backdropFilter: mounted ? 'blur(6px)' : 'blur(0px)',
    transition: 'background 0.25s ease, backdrop-filter 0.25s ease',
  }

  const modalStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: isMobile ? '20px 20px 0 0' : 20,
    width: '100%',
    maxWidth: isMobile ? '100%' : 700,
    maxHeight: isMobile ? '92vh' : '90vh',
    overflowY: 'auto',
    boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
    transform: mounted
      ? 'translateY(0) scale(1)'
      : isMobile ? 'translateY(100%)' : 'translateY(24px) scale(0.97)',
    opacity: mounted ? 1 : isMobile ? 1 : 0,
    transition: isMobile
      ? 'transform 0.3s cubic-bezier(0.32,0.72,0,1)'
      : 'transform 0.26s cubic-bezier(0.34,1.3,0.64,1), opacity 0.22s ease',
    display: 'flex', flexDirection: 'column',
    ...(isMobile ? { position: 'fixed', bottom: 0, left: 0, right: 0 } : {}),
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
        .gm-store-link:hover { border-color: var(--muted) !important; color: var(--text) !important; }
        .gm-tag-more:hover { color: var(--text) !important; }
      `}</style>

      <div onClick={close} style={overlayStyle}>
        <div onClick={e => e.stopPropagation()} style={modalStyle}>

          {/* ── TOP PANEL: metadata left, cover right ── */}
          <div style={{
            display: 'flex',
            minHeight: isMobile ? 'auto' : 220,
            height: 'auto',       // Forces container to expand with content
            flexShrink: 0,        // Prevents the modal body from crushing this section
            position: 'relative'
          }}>

            {/* Left column — all game info */}
            <div style={{ flex: 1, padding: isMobile ? '18px 16px 16px' : '22px 22px 18px', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

              {/* Title + subtitle */}
              <div>
                <h2 style={{ margin: '0 0 4px', fontFamily: 'Bebas Neue', fontSize: isMobile ? 26 : 30, letterSpacing: 1.2, color: 'var(--text)', lineHeight: 1.05 }}>
                  {game.title}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 8px', alignItems: 'center' }}>
                  {developer && <span style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600 }}>{developer}</span>}
                  {developer && (publisher || year) && <span style={{ color: 'var(--border)', fontSize: 12 }}>·</span>}
                  {publisher && developer !== publisher && <span style={{ color: 'var(--muted)', fontSize: 12 }}>{publisher}</span>}
                  {publisher && developer !== publisher && year && <span style={{ color: 'var(--border)', fontSize: 12 }}>·</span>}
                  {year && <span style={{ color: 'var(--muted)', fontSize: 12 }}>{year}</span>}
                  {!details && <span style={{ color: 'var(--muted)', fontSize: 11, fontStyle: 'italic' }}>Loading…</span>}
                </div>
              </div>

              {/* Metacritic + ESRB row */}
              {(metacritic || esrb) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {metacritic && (() => {
                    const s = metacriticStyle(metacritic)
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 8, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 20, color: s.color, letterSpacing: 0.5, flexShrink: 0 }}>
                          {metacritic}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>Metacritic</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>Critic score</div>
                        </div>
                      </div>
                    )
                  })()}
                  {metacritic && esrb && <div style={{ width: 1, height: 32, background: 'var(--border)' }} />}
                  {esrb && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 3 }}>AGE RATING</div>
                      <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, background: '#2a1f10', color: '#f59e0b', border: '1px solid #4a3520' }}>
                        {esrb}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Platforms */}
              {platforms.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 6 }}>PLATFORMS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {platforms.map((p: any) => {
                      const mapped = PLATFORM_MAP[p.slug]
                      if (!mapped) return null

                      // mapped.Icon must be rendered as a component tag <mapped.Icon />
                      return (
                        <span key={p.slug} style={pillStyle}>
                          <mapped.Icon style={{ fontSize: 12, marginRight: 4 }} />
                          {mapped.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Store links */}

              {/* Tags */}
              {totalTags > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 6 }}>TAGS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                    {tags.map((t: any) => (
                      <span key={t.id} style={pillStyle}>{t.name}</span>
                    ))}
                    {!showAllTags && totalTags > 5 && (
                      <span
                        className="gm-tag-more"
                        onClick={() => setShowAllTags(true)}
                        style={{ ...pillStyle, cursor: 'pointer', color: 'var(--muted)', borderStyle: 'dashed' }}
                      >
                        +{totalTags - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}


            </div>

            {/* Right column — cover art */}
            <div style={{
              width: isMobile ? 110 : 148,
              aspectRatio: '3/4',
              flexShrink: 0,
              borderRadius: 12,
              overflow: 'hidden',
              alignSelf: 'center',
              marginRight: isMobile ? 16 : 24, // Adds breathing room against the right wall
            }}>
              {game.cover
                ? <img src={game.cover} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" decoding="async" />
                : <div style={{ width: '100%', height: '100%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12, fontWeight: 700 }}>NO COVER</div>
              }
            </div>

            {/* Badges overlaid on top of the panel */}
            {readOnly && (
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'var(--muted)', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6, letterSpacing: 0.5 }}>
                View Only
              </div>
            )}
            <button
              onClick={close}
              style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background 0.15s', zIndex: 1 }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
            >✕</button>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: 'var(--border)', flexShrink: 0 }} />

          {/* ── BODY: status / rating / review / actions ── */}
          <div style={{ padding: isMobile ? '18px 16px 24px' : '22px 24px 26px', display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Status — editable */}
            {!readOnly && (
              <Section label="STATUS">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => markDirty(setPendingStatus)(s)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: pendingStatus === s ? STATUS_COLORS[s] : 'var(--surface2)', color: pendingStatus === s ? (s === 'unplayed' ? '#fff' : '#000') : 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', transform: pendingStatus === s ? 'scale(1.05)' : 'scale(1)', boxShadow: pendingStatus === s ? `0 4px 16px ${STATUS_COLORS[s]}55` : 'none' }}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* Status — read-only badge */}
            {readOnly && (
              <Section label="STATUS">
                <span style={{ display: 'inline-block', background: STATUS_COLORS[game.status], color: game.status === 'unplayed' ? '#fff' : '#000', fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 8 }}>
                  {STATUS_LABELS[game.status]}
                </span>
              </Section>
            )}

            {/* Rating — editable */}
            {!readOnly && (
              <Section label="YOUR RATING">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button key={n} onClick={() => markDirty(setPendingRating)(pendingRating === n ? null : n)} style={{ width: 36, height: 36, borderRadius: 7, border: 'none', background: (pendingRating ?? 0) >= n ? 'var(--accent)' : 'var(--surface2)', color: (pendingRating ?? 0) >= n ? '#000' : 'var(--muted)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.12s', transform: (pendingRating ?? 0) >= n ? 'scale(1.08)' : 'scale(1)' }}>
                      {n}
                    </button>
                  ))}
                  {pendingRating && (
                    <span style={{ marginLeft: 6, fontFamily: 'Bebas Neue', fontSize: 26, color: 'var(--accent)', letterSpacing: 1 }}>{pendingRating}/10</span>
                  )}
                </div>
              </Section>
            )}

            {/* Rating — read-only */}
            {readOnly && game.rating && (
              <Section label="RATING">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <div key={n} style={{ width: 36, height: 36, borderRadius: 7, background: (game.rating ?? 0) >= n ? 'var(--accent)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (game.rating ?? 0) >= n ? '#000' : 'var(--muted)', fontSize: 13, fontWeight: 700 }}>
                      {n}
                    </div>
                  ))}
                  <span style={{ marginLeft: 6, fontFamily: 'Bebas Neue', fontSize: 26, color: 'var(--accent)', letterSpacing: 1 }}>{game.rating}/10</span>
                </div>
              </Section>
            )}

            {/* Review */}
            <Section label={
              readOnly ? (
                <span>REVIEW</span>
              ) : (
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
              )
            }>
              {(!editMode || readOnly) && (
                <div className="review-markdown" style={{ minHeight: 80, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  {(readOnly ? game.review : pendingReview)
                    ? <ReactMarkdown>{readOnly ? game.review! : pendingReview}</ReactMarkdown>
                    : <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
                      {readOnly ? 'No review written.' : 'No review yet — toggle Edit to write one.'}
                    </span>
                  }
                </div>
              )}
              {!readOnly && editMode && (
                <div>
                  <textarea
                    value={pendingReview}
                    onChange={e => { setPendingReview(e.target.value); setDirty(true) }}
                    placeholder={'Write your review in Markdown...\n\n**Bold**, *italic*, ## Headings, > Blockquotes'}
                    style={{ width: '100%', minHeight: 140, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 13, padding: '12px 14px', outline: 'none', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.7, boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--muted)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                  <div style={{ marginTop: 6, display: 'flex', gap: 12, color: 'var(--muted)', fontSize: 11 }}>
                    <span>**bold**</span><span>*italic*</span><span>## heading</span><span>&gt; quote</span><span>- list</span>
                  </div>
                </div>
              )}
            </Section>

            {/* Confirm — editable only */}
            {!readOnly && (
              <button
                onClick={confirm}
                disabled={!dirty}
                style={{ width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none', background: dirty ? 'var(--accent)' : 'var(--surface2)', color: dirty ? '#000' : 'var(--muted)', fontWeight: 700, fontSize: 14, cursor: dirty ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', boxShadow: dirty ? '0 4px 20px rgba(232,255,71,0.25)' : 'none' }}
              >
                {dirty ? '✓ Save changes' : 'No changes'}
              </button>
            )}

            {/* Move + Remove — editable only */}
            {!readOnly && (
              <div style={{ display: 'flex', gap: 10, paddingTop: 4, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                {otherLists.map(l => {
                  const s = listStyles[l]
                  return (
                    <button key={l} onClick={() => { moveToList(game.id, l); close() }}
                      style={{ flex: 1, padding: '11px 16px', borderRadius: 10, border: `1px solid ${s.border}`, background: s.bg, color: s.color, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'filter 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
                      onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
                    >
                      Move to {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  )
                })}
                <button onClick={() => { removeGame(game.id); close() }}
                  style={{ padding: '11px 16px', borderRadius: 10, border: 'none', background: '#3f1a1a', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#5a2020')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#3f1a1a')}
                >
                  Remove
                </button>
              </div>
            )}

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