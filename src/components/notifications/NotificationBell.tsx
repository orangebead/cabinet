import { useEffect, useRef } from 'react'
import { useNotificationStore } from '../../store/notificationStore'
import { useAuthStore } from '../../store/authStore'
import type { Notification } from '../../types'

export function NotificationBell() {
  const { user } = useAuthStore()
  const { notifications, unreadCount, open, setOpen, markAllRead, markRead } = useNotificationStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    setOpen(!open)
    if (!open && unreadCount > 0 && user) markAllRead(user.id)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{ position: 'relative', width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', background: open ? 'var(--surface2)' : 'transparent', color: unreadCount > 0 ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.15s', flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        🔔
        {unreadCount > 0 && (
          <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)', color: '#000', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--surface)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 300, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>Notifications</span>
            {notifications.length > 0 && (
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>All caught up ✓</span>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <NotificationRow key={n.id} notification={n} onRead={() => markRead(n.id)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationRow({ notification: n }: { notification: Notification; onRead: () => void }) {
  const profile = n.from_profile
  const initial = (profile?.display_name || profile?.username || '?')[0].toUpperCase()

  const message = () => {
    switch (n.type) {
      case 'follow': return 'started following you'
      case 'game_added': return 'added a game to their cabinet'
      case 'review_written': return 'wrote a new review'
      default: return ''
    }
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div
      style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: !n.read ? 'rgba(232,255,71,0.04)' : 'transparent', transition: 'background 0.15s', cursor: 'default' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
      onMouseLeave={e => (e.currentTarget.style.background = !n.read ? 'rgba(232,255,71,0.04)' : 'transparent')}
    >
      {/* Avatar */}
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue', fontSize: 16, color: '#000', flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.4 }}>
          <span style={{ fontWeight: 600 }}>@{profile?.username ?? 'someone'}</span>
          {' '}
          <span style={{ color: 'var(--muted)' }}>{message()}</span>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 3 }}>{timeAgo(n.created_at)}</div>
      </div>
      {/* Unread dot */}
      {!n.read && (
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />
      )}
    </div>
  )
}