import { Sidebar } from './components/layout/Sidebar'
import { CabinetPage } from './pages/CabinetPage'

function App() {
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