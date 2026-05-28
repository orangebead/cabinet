import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import { Sidebar } from './components/layout/Sidebar'
import { CabinetPage } from './pages/CabinetPage'
import { AuthPage } from './pages/AuthPage'

function App() {
  const { user, loading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 4, color: 'var(--accent)', opacity: 0.5 }}>
          CABINET
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>
        <CabinetPage />
      </div>
    </div>
  )
}

export default App