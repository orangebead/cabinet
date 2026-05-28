import { useCabinetStore } from '../../store/cabinetStore'
import { useAuthStore } from '../../store/authStore'
import type { GameList } from '../../types'

const lists: { id: GameList; label: string; icon: string }[] = [
  { id: 'cabinet', label: 'My Cabinet', icon: '🗃️' },
  { id: 'backlog', label: 'Backlog', icon: '📋' },
  { id: 'wishlist', label: 'Wishlist', icon: '✨' },
]

export function Sidebar() {
  const { activeList, setActiveList, games } = useCabinetStore()
  const { user, signOut } = useAuthStore()

  const counts = {
    cabinet: games.filter(g => g.list === 'cabinet').length,
    backlog: games.filter(g => g.list === 'backlog').length,
    wishlist: games.filter(g => g.list === 'wishlist').length,
  }

  const initial = user?.email?.[0].toUpperCase() ?? '?'

  return (
    <aside style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden' }}>

      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: 3, color: 'var(--accent)', lineHeight: 1 }}>CABINET</div>
        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4, letterSpacing: 1 }}>YOUR GAME SHELF</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {lists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveList(list.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, border: 'none', background: activeList === list.id ? 'var(--surface2)' : 'transparent', color: activeList === list.id ? 'var(--text)' : 'var(--muted)', cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s', borderLeft: activeList === list.id ? '2px solid var(--accent)' : '2px solid transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{list.icon}</span>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{list.label}</span>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 11, padding: '2px 7px', borderRadius: 10, fontWeight: 600 }}>{counts[list.id]}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          {/* Avatar initial */}
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text)', fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={signOut}
          style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}