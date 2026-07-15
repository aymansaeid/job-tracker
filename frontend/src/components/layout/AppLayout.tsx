import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import WelcomeModal from '../common/WelcomeModal'
import { NAV_ITEMS } from './navConfig'
import { Toaster } from 'react-hot-toast'

function AmbientBackground() {
  const reduceMotion = useReducedMotion()
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-surface-base" />
      <motion.div
        className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-cyan-500 opacity-[0.07] blur-[140px]"
        animate={reduceMotion ? undefined : { x: [0, 50, 0], y: [0, 35, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="noise-overlay absolute inset-0" />
    </div>
  )
}

const TITLE_FALLBACK = 'JobTracker'

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = NAV_ITEMS.find((item) => item.to === pathname)?.label ?? TITLE_FALLBACK
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Automatically close the mobile drawer when navigating to a new route
  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white">
      <AmbientBackground />

      <div className="relative z-10 flex h-screen w-full">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar title={title} onMenuClick={() => setMobileNavOpen(true)} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Toaster position="top-center" gutter={12} />
      <WelcomeModal />
    </div>
  )
}