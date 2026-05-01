import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Warga from './pages/Warga'
import CatatMeter from './pages/CatatMeter'
import Riwayat from './pages/Riwayat'
import BottomNav from './components/BottomNav'

function AppContent() {
  return (
    <div className="pb-16">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/warga" element={<Warga />} />
        <Route path="/catat" element={<CatatMeter />} />
        <Route path="/riwayat" element={<Riwayat />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App