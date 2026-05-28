import { useCabinetStore } from '../../store/cabinetStore'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore } from '../../store/profileStore'
import type { GameList } from '../../types'
import type { Page } from '../../App'

const lists: { id: GameList; label: string; icon: string }[] = [
  { id: 'cabinet', label: 'My Cabinet', icon: '🗃️' },
  { id: 'backlog', label: 'Backlog', icon: '📋' },
  { id: 'wishlist', label: 'Wishlist', icon: '✨' },
]

interface Props {
  currentPage: Page['id']
  onNavigate: (page: Page) => void
}

export function Sidebar({ currentPage, onNavigate }: Props) {
  const { activeList, setActiveList, games } = useCabinetStore()
  const { user, signOut } = useAuthStore()
  const { profile } = useProfileStore()

  const counts = {
    cabinet: games.filter(g => g.list === 'cabinet').length,
    backlog: games.filter(g => g.list === 'backlog').length,
    wishlist: games.filter(g => g.list === 'wishlist').length,
  }

  const initial = (profile?.display_name || profile?.username || user?.email || '?')[0].toUpperCase()

  const navBtn = (active: boolean) => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8, border: 'none',
    background: active ? 'var(--surface2)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--muted)',
    cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s',
    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: active ? 600 : 400,
  } as React.CSSProperties)

  return (
    <aside style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden' }}>

      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 3, color: 'var(--accent)', lineHeight: 1 }}>CABINET</div>
        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4, letterSpacing: 1 }}>YOUR GAME SHELF</div>
      </div>

      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        {/* My lists */}
        <div style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: '0 12px', marginBottom: 6 }}>MY LISTS</div>
        {lists.map(list => (
          <button
            key={list.id}
            onClick={() => { setActiveList(list.id); onNavigate({ id: 'cabinet' }) }}
            style={{ ...navBtn(currentPage === 'cabinet' && activeList === list.id), justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{list.icon}</span>
              <span>{list.label}</span>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>{counts[list.id]}</span>
          </button>
        ))}

        {/* Social */}
        <div style={{ color: 'var(--muted)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: '12px 12px 6px', marginTop: 8 }}>SOCIAL</div>
        <button onClick={() => onNavigate({ id: 'profile' })} style={navBtn(currentPage === 'profile')}>
          <span style={{ fontSize: 16 }}>👤</span>
          <span>Profile</span>
        </button>
        <button onClick={() => onNavigate({ id: 'friends' })} style={navBtn(currentPage === 'friends')}>
          <span style={{ fontSize: 16 }}>👥</span>
          <span>Friends</span>
        </button>
      </nav>

      {/* User */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.display_name || `@${profile?.username}`}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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