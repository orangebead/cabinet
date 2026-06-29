import React, { useState } from 'react'
import { useCabinetStore } from '../../store/cabinetStore'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore } from '../../store/profileStore'
// import { NotificationBell } from '../notifications/NotificationBell'
import type { GameList } from '../../types'
import type { Page } from '../../App'

const lists: { id: GameList; label: string; icon: string }[] = [
  { id: 'cabinet', label: 'Cabinet', icon: '' },
  { id: 'backlog', label: 'Backlog', icon: '' },
  { id: 'wishlist', label: 'Wishlist', icon: '' },
]

interface Props {
  currentPage: Page['id']
  onNavigate: (page: Page) => void
}

export function Sidebar({ currentPage, onNavigate }: Props) {
  const { activeList, setActiveList, games } = useCabinetStore()
  const { user, signOut } = useAuthStore()
  const { profile } = useProfileStore()

  // Create a local state boolean to control your privacy drawer visibility
  const [showPrivacy, setShowPrivacy] = useState(false)

  const counts = {
    cabinet: games.filter(g => g.list === 'cabinet').length,
    backlog: games.filter(g => g.list === 'backlog').length,
    wishlist: games.filter(g => g.list === 'wishlist').length,
  }

  const initial = (profile?.display_name || profile?.username || user?.email || '?')[0].toUpperCase()

  const navBtn = (active: boolean): React.CSSProperties => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8, border: 'none',
    background: active ? 'var(--surface2)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--muted)',
    cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s',
    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: active ? 600 : 400,
    textAlign: 'left',
  })

  return (
    <>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: 220, height: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 50, overflow: 'hidden' }}>

        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 32, letterSpacing: 0.1, color: 'var(--accent)', lineHeight: 1 }}>Cabinet</div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: 'var(--muted)', fontSize: 20 , fontWeight: 700, letterSpacing: 0.1, padding: '0 12px', marginBottom: 6 }}>My Lists</div>
          {lists.map(list => (
            <button key={list.id} onClick={() => { setActiveList(list.id); onNavigate({ id: 'cabinet' }) }} style={{ ...navBtn(currentPage === 'cabinet' && activeList === list.id), justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{list.icon}</span>
                <span>{list.label}</span>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>{counts[list.id]}</span>
            </button>
          ))}

          <div style={{ color: 'var(--muted)', fontSize: 20, fontWeight: 700, letterSpacing: 0.1, padding: '12px 12px 6px', marginTop: 8 }}>Social</div>
          <button onClick={() => onNavigate({ id: 'profile' })} style={navBtn(currentPage === 'profile' || currentPage === 'view-profile')}>
            <span style={{ fontSize: 16 }}></span><span>Profile</span>
          </button>
          <button onClick={() => onNavigate({ id: 'social' })} style={navBtn(currentPage === 'social' || currentPage === 'view-cabinet')}>
            <span style={{ fontSize: 16 }}></span><span>Social</span>
          </button>

          {/* Privacy Concerns Action — pushed down cleanly inside the navigation links layout container */}
          <button
            onClick={() => setShowPrivacy(true)}
            style={{ ...navBtn(false), marginTop: 'auto', color: 'var(--muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            <span style={{ fontSize: 16 }}></span><span>Privacy Concerns?</span>
          </button>
        </nav>

        {/* User Account Session Actions Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.display_name || `@${profile?.username}`}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
            {/* <NotificationBell /> */}
          </div>
          <button onClick={signOut} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)' }}
          >Sign out</button>
        </div>
      </aside>

      {/* Conditionally reveal the security modal drawer backdrop markup */}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </>
  )
}

interface PrivacyModalProps {
  onClose: () => void
}

function PrivacyModal({ onClose }: PrivacyModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
        zIndex: 200, display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 16, width: '100%', maxWidth: 440,
          padding: 24, display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)', fontFamily: 'Rethink Sans, sans-serif'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: 24, letterSpacing: 0.1, color: 'var(--accent)' }}>
            Privacy & Security
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ color: 'var(--text)', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0 }}>
            Cabinet is a personal, non-commercial game shelf project built to track our video game collections and play sessions.
          </p>
          <p style={{ margin: 0 }}>
            Your gaming shelf configuration is secured at the database layer using PostgreSQL Row Level Security (RLS).
          </p>
          <blockquote style={{ margin: 0, padding: '10px 14px', background: 'var(--bg)', borderLeft: '3px solid var(--accent)', borderRadius: 6, color: 'var(--muted)', fontSize: 12 }}>
            "Even if someone manages to find or guess your public project API keys, they are hard-blocked from viewing, modifying, or deleting any game logs belonging to your account."
          </blockquote>
          <p style={{ margin: 0 }}>
            By default, your shelf layout is <strong>Public</strong> so friends can view your cabinet and follow your progression tracker, but you can toggle your profile to <strong>Private</strong> anytime inside your account management console to lock down visibility completely.
          </p>
          <p style={{ margin: 0 }}>
            We do not sell, share, or track your data with any third-party services. Because this is a shared hobby project, it is provided entirely "as-is" with no uptime guarantees or formal Service Level Agreements (SLA).
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 20, padding: '10px 0', borderRadius: 8,
            background: 'var(--surface2)', color: 'var(--text)', fontWeight: 600,
            fontSize: 13, cursor: 'pointer', border: '1px solid var(--border)',
            transition: 'all 0.15s', fontFamily: 'Rethink Sans, sans-serif'
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface2)')}
        >
          Understood, Close
        </button>
      </div>
    </div>
  )
}