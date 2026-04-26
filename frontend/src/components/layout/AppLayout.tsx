import { motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import WelcomeModal from '../common/WelcomeModal'

// Map routes to page titles
const TITLES: Record<string, string> = {
  '/app/dashboard':    'Dashboard',
  '/app/kanban':       'Kanban Board',
  '/app/applications': 'Applications',
  '/app/Folders':      'My Folders',
  '/app/settings':     'Settings',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = TITLES[pathname] ?? 'JobTracker'

  return (
    // 1. Unified the wrapper into a single, clean full-screen flex container
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden">

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden relative">
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

      {/* 2. Place the WelcomeModal at the absolute root so it blurs everything cleanly! */}
      <WelcomeModal />
      
    </div>
  )
}