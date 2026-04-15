import { motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

// Map routes to page titles
const TITLES: Record<string, string> = {
  '/app/dashboard':    'Dashboard',
  '/app/kanban':       'Kanban Board',
  '/app/applications': 'Applications',
  '/app/ai':           'AI Suggestions',
  '/app/settings':     'Settings',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'JobTracker'

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title={title} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

    </div>
  )
}