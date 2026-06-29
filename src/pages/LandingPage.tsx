import { useEffect, useRef, useState } from 'react'

interface Props {
  onEnter: () => void // navigates to auth/login
}

// ── Fake shelf data — realistic enough to show the product ────────────────────
const SHELF_CARDS = [
  { title: 'Elden Ring',        cover: 'https://media.rawg.io/media/resize/1280/-/games/b29/b294fdd866dcdb643e7bab370a552855.jpg', status: 'Completed',   rating: 10, color: '#4ade80' },
  { title: 'Hollow Knight',     cover: 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg', status: 'Playing',     rating: null, color: '#60a5fa' },
  { title: 'Hades',             cover: 'https://media.rawg.io/media/resize/1280/-/games/1f4/1f47a270b8f241e4676b14d39ec620f7.jpg', status: '100%',        rating: 9,  color: '#ffb3f0' },
  { title: 'Celeste',           cover: 'https://media.rawg.io/media/games/594/59487800889ebac294c7c2c070d02356.jpg', status: 'Completed',   rating: 9,  color: '#4ade80' },
  { title: 'Disco Elysium',     cover: 'https://media.rawg.io/media/games/d5a/d5a24f9f71315427fa6e966fdd98dfa6.jpg', status: 'Completed',   rating: 10, color: '#4ade80' },
  { title: 'Outer Wilds',       cover: 'https://media.rawg.io/media/resize/1280/-/games/9f4/9f418898f5415668ca47b5f4ab1ecfeb.jpg', status: 'Backlog',     rating: null, color: '#6b6b7a' },
  { title: 'Red Dead Redemption 2', cover: 'https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg', status: 'Playing', rating: null, color: '#60a5fa' },
  { title: 'Cyberpunk 2077', cover: 'https://media.rawg.io/media/resize/1280/-/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg', status: 'Playing', rating: null, color: '#60a5fa' }, 
]

const FEATURES = [
  {
    title: 'Your shelf, your way',
    body: 'Cabinet, Backlog, Wishlist — every game goes exactly where it belongs. Track what you\'re playing, what\'s waiting, and what you\'re dreaming about.',
  },
  {
    title: 'Rate & review everything',
    body: 'Score out of 10, write a markdown review, mark it 100%. Your opinions live in one place, always yours to revisit.',
  },
  {
    title: 'Follow your friends',
    body: 'See what your friends are playing right now. Browse their cabinets, compare ratings, and discover your next game through people you trust.',
  },
  {
    title: 'Insights on your habits',
    body: 'Completion rate, favourite genres, rating patterns — your Insights tab turns your backlog guilt into something actually interesting.',
  },
]

// ── ShelfCard component ───────────────────────────────────────────────────────
function ShelfCard({ card, delay }: { card: typeof SHELF_CARDS[0]; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div style={{
      width: 120, flexShrink: 0,
      borderRadius: 10, overflow: 'hidden',
      border: '1px solid #2a2a32',
      background: '#111114',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
      opacity: visible ? 1 : 0,
      transition: `transform 0.5s cubic-bezier(0.34,1.2,0.64,1), opacity 0.4s ease`,
    }}>
      <div style={{ position: 'relative', aspectRatio: '3/4', background: '#1a1a1f' }}>
        <img
          src={card.cover}
          alt={card.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
        <div style={{
          position: 'absolute', top: 7, left: 7,
          background: card.color, color: card.color === '#6b6b7a' ? '#e8e8f0' : '#000',
          fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          fontFamily: 'Rethink Sans, sans-serif',
        }}>
          {card.status}
        </div>
        {card.rating && (
          <div style={{
            position: 'absolute', top: 7, right: 7,
            background: 'rgba(0,0,0,0.85)', color: '#ffb3f0',
            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            fontFamily: 'Space Grotesk, sans-serif',
          }}>
            {card.rating}/10
          </div>
        )}
      </div>
      <div style={{ padding: '8px 9px 10px', fontSize: 11, fontWeight: 500, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Rethink Sans, sans-serif' }}>
        {card.title}
      </div>
    </div>
  )
}

// ── LandingPage ───────────────────────────────────────────────────────────────
export function LandingPage({ onEnter }: Props) {
  const heroRef = useRef<HTMLDivElement>(null)
  const [heroVisible, setHeroVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: '#0a0a0b', color: '#e8e8f0', minHeight: '100vh', fontFamily: 'Rethink Sans, sans-serif', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Rethink+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 10px; border: none;
          background: #ffb3f0; color: #000;
          font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 0 0 0 rgba(255,179,240,0);
          text-decoration: none;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,179,240,0.35);
        }
        .cta-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 10px;
          border: 1px solid #2a2a32; background: transparent; color: #e8e8f0;
          font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
        }
        .cta-btn-ghost:hover { background: #1a1a1f; border-color: #6b6b7a; }

        .feature-card {
          background: #111114; border: 1px solid #2a2a32; border-radius: 14px;
          padding: 28px 24px; transition: border-color 0.2s, transform 0.2s;
        }
        .feature-card:hover { border-color: #ffb3f0; transform: translateY(-3px); }

        .wavy {
          text-decoration: underline wavy #ffb3f0;
          text-decoration-thickness: 3px;
          text-underline-offset: 6px;
        }

        .fade-in {
          opacity: 0; transform: translateY(18px);
          animation: fadeUp 0.6s ease forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .hero-inner { flex-direction: column !important; }
          .hero-text { text-align: center; align-items: center !important; }
          .hero-title { font-size: 48px !important; }
          .shelf-row { justify-content: center !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-strip { flex-direction: column !important; gap: 32px !important; }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrollY > 20 ? 'rgba(10,10,11,0.92)' : 'transparent',
        backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
        borderBottom: scrollY > 20 ? '1px solid #2a2a32' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 700, color: '#ffb3f0', letterSpacing: 0 }}>
          Cabinet
        </div>
        <button className="cta-btn" onClick={onEnter} style={{ padding: '8px 20px', fontSize: 13 }}>
          Sign in →
        </button>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 40px 60px' }}>
        <div className="hero-inner" style={{ display: 'flex', alignItems: 'center', gap: 60, width: '100%', maxWidth: 1200, margin: '0 auto' }}>

          {/* Left — headline + CTA */}
          <div className="hero-text" style={{
            flex: '0 0 auto', maxWidth: 520,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24,
            opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>
            <h1 className="hero-title" style={{ fontFamily: 'Space Grotesk', fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1, color: '#e8e8f0' }}>
              Every game<br />
              you've ever{' '}
              <span className="wavy" style={{ color: '#ffb3f0' }}>played</span>
              <span style={{ color: '#ffb3f0' }}>.</span>
            </h1>

            <p style={{ fontSize: 17, color: '#6b6b7a', lineHeight: 1.7, maxWidth: 420 }}>
              Cabinet is your personal game tracker. Log what you're playing, rate what you've finished, and follow friends to see what they're upto.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="cta-btn" onClick={onEnter}>
                Start tracking →
              </button>
              <button className="cta-btn-ghost" onClick={onEnter}>
                Sign in
              </button>
            </div>
          </div>

          {/* Right — shelf cards */}
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {/* Row 1 */}
            <div className="shelf-row" style={{ display: 'flex', gap: 12, marginBottom: 12, paddingLeft: 20 }}>
              {SHELF_CARDS.slice(0, 4).map((card, i) => (
                <ShelfCard key={card.title} card={card} delay={300 + i * 80} />
              ))}
            </div>
            {/* Row 2 — offset */}
            <div className="shelf-row" style={{ display: 'flex', gap: 12, paddingLeft: 60 }}>
              {SHELF_CARDS.slice(4, 8).map((card, i) => (
                <ShelfCard key={card.title + '2'} card={card} delay={600 + i * 80} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ marginBottom: 48, maxWidth: 520 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 38, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.5, color: '#e8e8f0' }}>
            No nonsense. Organize your experiences, share your opinions, and follow your friends.
          </h2>
        </div>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="feature-card fade-in"
            >
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#e8e8f0', marginBottom: 10, letterSpacing: -0.2 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 14, color: '#6b6b7a', lineHeight: 1.7 }}>
                {f.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════════════ */}
      {/* <section style={{ padding: '60px 40px', borderTop: '1px solid #2a2a32', borderBottom: '1px solid #2a2a32' }}>
        <div className="stats-strip" style={{ display: 'flex', justifyContent: 'center', gap: 80, maxWidth: 1200, margin: '0 auto' }}>
          {[
            { value: '10k+', label: 'Games tracked' },
            { value: '2.4k+', label: 'Reviews written' },
            { value: '94%',   label: 'Average completion rate' },
            { value: '∞',     label: 'Backlog guilt' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 48, fontWeight: 700, color: '#ffb3f0', lineHeight: 1, letterSpacing: -1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: '#6b6b7a', marginTop: 6, fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* ══════════════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 44, fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.5, color: '#e8e8f0' }}>
            Your backlog isn't going<br />
            to clear <span style={{ color: '#ffb3f0' }}>itself</span>.
          </h2>
          <p style={{ fontSize: 16, color: '#6b6b7a', lineHeight: 1.7, maxWidth: 400 }}>
            Start building your shelf today. It's free, it takes two minutes to get started, and your friends are probably already on it.
          </p>
          <button className="cta-btn" onClick={onEnter} style={{ fontSize: 16, padding: '16px 40px' }}>
            Open my Cabinet →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '24px 40px', borderTop: '1px solid #2a2a32', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 700, color: '#ffb3f0' }}>Cabinet</div>
        <div style={{ fontSize: 12, color: '#3a3a42' }}>A personal game tracking project. Built for fun, not profit.</div>
      </footer>

    </div>
  )
}