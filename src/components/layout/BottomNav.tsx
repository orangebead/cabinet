import { useCabinetStore } from '../../store/cabinetStore'
import { useNotificationStore } from '../../store/notificationStore'
import type { GameList } from '../../types'
import type { Page } from '../../App'

interface Props {
  currentPage: Page['id']
  onNavigate: (page: Page) => void
}

export function BottomNav({ currentPage, onNavigate }: Props) {
  const { activeList, setActiveList } = useCabinetStore()
  const { unreadCount } = useNotificationStore()

  const navItems = [
    { id: 'cabinet', label: 'Cabinet', icon: '🗃️', action: () => { setActiveList('cabinet' as GameList); onNavigate({ id: 'cabinet' }) } },
    { id: 'backlog', label: 'Backlog', icon: '📋', action: () => { setActiveList('backlog' as GameList); onNavigate({ id: 'cabinet' }) } },
    { id: 'wishlist', label: 'Wishlist', icon: '✨', action: () => { setActiveList('wishlist' as GameList); onNavigate({ id: 'cabinet' }) } },
    { id: 'social', label: 'Social', icon: '📡', action: () => onNavigate({ id: 'social' }) },
    { id: 'profile', label: 'Profile', icon: '👤', action: () => onNavigate({ id: 'profile' }) },
  ]

  const isActive = (id: string) => {
    if (id === 'cabinet') return currentPage === 'cabinet' && activeList === 'cabinet'
    if (id === 'backlog') return currentPage === 'cabinet' && activeList === 'backlog'
    if (id === 'wishlist') return currentPage === 'cabinet' && activeList === 'wishlist'
    return currentPage === id
  }

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={item.action}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 3, padding: '10px 4px',
            border: 'none', background: 'transparent',
            color: isActive(item.id) ? 'var(--accent)' : 'var(--muted)',
            cursor: 'pointer', position: 'relative',
            transition: 'color 0.15s',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          <span style={{ fontSize: 20, position: 'relative' }}>
            {item.icon}
            {item.id === 'social' && unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -6, width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', color: '#000', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
          <span style={{ fontSize: 9, fontWeight: isActive(item.id) ? 700 : 400, letterSpacing: 0.3 }}>
            {item.label}
          </span>
          {isActive(item.id) && (
            <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: 'var(--accent)', borderRadius: '0 0 2px 2px' }} />
          )}
        </button>
      ))}
    </nav>
  )
}