import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { useCabinetStore } from './store/cabinetStore'
import { useProfileStore } from './store/profileStore'
import { Sidebar } from './components/layout/Sidebar'
import { CabinetPage } from './pages/CabinetPage'
import { AuthPage } from './pages/AuthPage'
import { ProfileSetupPage } from './pages/ProfileSetupPage'
import { ProfilePage } from './pages/ProfilePage'
import { FriendsPage } from './pages/FriendsPage'
import { FriendCabinetPage } from './pages/FriendCabinetPage'

export type Page =
  | { id: 'cabinet' }
  | { id: 'profile' }
  | { id: 'friends' }
  | { id: 'view-profile'; username: string }
  | { id: 'view-cabinet'; userId: string; username: string }

function App() {
  const { user, loading, setUser, setLoading } = useAuthStore()
  const fetchGames = useCabinetStore(s => s.fetchGames)
  const { profile, loadingProfile, fetchProfile } = useProfileStore()
  const [page, setPage] = useState<Page>({ id: 'cabinet' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        fetchGames(session.user.id)
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchGames(session.user.id)
        fetchProfile(session.user.id)
      } else {
        useCabinetStore.setState({ games: [] })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading || loadingProfile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 4, color: 'var(--accent)', opacity: 0.5 }}>CABINET</div>
      </div>
    )
  }

  if (!user) return <AuthPage />
  if (!profile) return <ProfileSetupPage userId={user.id} />

  const renderPage = () => {
    switch (page.id) {
      case 'cabinet': return <CabinetPage />
      case 'profile': return <ProfilePage onViewCabinet={(userId, username) => setPage({ id: 'view-cabinet', userId, username })} />
      case 'friends': return (
        <FriendsPage
          onViewProfile={username => setPage({ id: 'view-profile', username })}
          onViewCabinet={(userId, username) => setPage({ id: 'view-cabinet', userId, username })}
        />
      )
      case 'view-profile': return (
        <ProfilePage
          username={page.username}
          onViewCabinet={(userId, username) => setPage({ id: 'view-cabinet', userId, username })}
        />
      )
      case 'view-cabinet': return (
        <FriendCabinetPage
          userId={page.userId}
          username={page.username}
          onBack={() => setPage({ id: 'friends' })}
        />
      )
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar currentPage={page.id} onNavigate={setPage} />
      <div style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>
        {renderPage()}
      </div>
    </div>
  )
}

export default App