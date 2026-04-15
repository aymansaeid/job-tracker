import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import AppLayout    from './components/layout/AppLayout'
import LandingPage  from './pages/LandingPage'
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status: number } })?.response?.status
        if (status === 401 || status === 403 || status === 404) return false
        return failureCount < 2
      },
    },
  },
})

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <>{children}</>
}

// Placeholder pages — we build these one by one next
function DashboardPage()    { return <p className="text-slate-400">Dashboard — coming next 👋</p> }
function KanbanPage()       { return <p className="text-slate-400">Kanban — coming soon</p> }
function ApplicationsPage() { return <p className="text-slate-400">Applications — coming soon</p> }
function AIPage()           { return <p className="text-slate-400">AI Suggestions — coming soon</p> }
function SettingsPage()     { return <p className="text-slate-400">Settings — coming soon</p> }

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<RequireGuest><LoginPage /></RequireGuest>} />
        <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />

        {/* Protected — all share AppLayout via nested routes */}
        <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index                  element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"       element={<DashboardPage />} />
          <Route path="kanban"          element={<KanbanPage />} />
          <Route path="applications"    element={<ApplicationsPage />} />
          <Route path="ai"              element={<AIPage />} />
          <Route path="settings"        element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AnimatedRoutes />
      </Router>
    </QueryClientProvider>
  )
}