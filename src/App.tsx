import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { useCabinetStore } from './store/cabinetStore'
import { useProfileStore } from './store/profileStore'
import { useIsMobile } from './hooks/useIsMobile'
import { Sidebar } from './components/layout/Sidebar'
import { BottomNav } from './components/layout/BottomNav'
import { useRealtimeNotifications } from './hooks/useRealTimeNotifications.ts'
import { CabinetPage } from './pages/CabinetPage'
import { AuthPage } from './pages/AuthPage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'
import { ProfilePage } from './pages/ProfilePage'
import { SocialPage } from './pages/SocialPage'
import { FriendCabinetPage } from './pages/FriendCabinetPage'
import { LandingPage } from './pages/LandingPage'

export type Page =
  | { id: 'cabinet' }
  | { id: 'profile' }
  | { id: 'social' }
  | { id: 'view-profile'; username: string }
  | { id: 'view-cabinet'; userId: string; username: string }

function App() {
  const { user, loading, setUser, setLoading } = useAuthStore()
  const fetchGames = useCabinetStore(s => s.fetchGames)
  const { profile, loadingProfile, fetchProfile } = useProfileStore()
  const [page, setPage] = useState<Page>({ id: 'cabinet' })
  const isMobile = useIsMobile()
  const [showLanding, setShowLanding] = useState(true)

  useRealtimeNotifications(user?.id)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        setShowLanding(false) // active session — skip landing
        fetchGames(session.user.id)
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setShowLanding(false) // just logged in — skip landing
        fetchGames(session.user.id)
        fetchProfile(session.user.id)
      } else {
        useCabinetStore.setState({ games: [] })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Landing — shown first to unauthenticated users ─────────────────────────
  // Must be before the loading check so it renders immediately on first visit
  // without waiting for Supabase to resolve the session.
  if (showLanding && !user && !loading) {
    return <LandingPage onEnter={() => setShowLanding(false)} />
  }

  if (loading) return <Splash />
  if (!user) return <AuthPage />
  if (loadingProfile) return <Splash />
  if (!profile) return <ProfileSetupPage userId={user.id} />

  const isDynamic = page.id === 'view-profile' || page.id === 'view-cabinet'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {!isMobile && <Sidebar currentPage={page.id} onNavigate={setPage} />}

      <div style={{
        marginLeft: isMobile ? 0 : 220,
        flex: 1, minWidth: 0,
        paddingBottom: isMobile ? 70 : 0,
      }}>
        <div style={{ display: !isDynamic && page.id === 'cabinet' ? 'block' : 'none' }}>
          <CabinetPage />
        </div>
        <div style={{ display: !isDynamic && page.id === 'profile' ? 'block' : 'none' }}>
          <ProfilePage onViewCabinet={(userId, username) => setPage({ id: 'view-cabinet', userId, username })} />
        </div>
        <div style={{ display: !isDynamic && page.id === 'social' ? 'block' : 'none' }}>
          <SocialPage
            onViewProfile={username => setPage({ id: 'view-profile', username })}
            onViewCabinet={(userId, username) => setPage({ id: 'view-cabinet', userId, username })}
          />
        </div>
        {page.id === 'view-profile' && (
          <ProfilePage
            username={page.username}
            onViewCabinet={(userId, username) => setPage({ id: 'view-cabinet', userId, username })}
          />
        )}
        {page.id === 'view-cabinet' && (
          <FriendCabinetPage
            userId={page.userId}
            username={page.username}
            onBack={() => setPage({ id: 'social' })}
          />
        )}
      </div>

      {isMobile && <BottomNav currentPage={page.id} onNavigate={setPage} />}
    </div>
  )
}

function Splash() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'Space Grotesk', fontSize: 32, letterSpacing: 0.1, color: 'var(--accent)', opacity: 0.5 }}>CABINET</div>
    </div>
  )
}

export default App