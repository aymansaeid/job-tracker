import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import WelcomeModal from '../common/WelcomeModal'
import { NAV_ITEMS } from './navConfig'

function AmbientBackground() {
  const reduceMotion = useReducedMotion()
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-surface-base" />
      <motion.div
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-500 opacity-[0.08] blur-[130px]"
        animate={reduceMotion ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-40 top-1/3 h-[460px] w-[460px] rounded-full bg-violet-500 opacity-[0.07] blur-[130px]"
        animate={reduceMotion ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="noise-overlay absolute inset-0" />
    </div>
  )
}

const TITLE_FALLBACK = 'JobTracker'

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = NAV_ITEMS.find((item) => item.to === pathname)?.label ?? TITLE_FALLBACK

  return (
    <div className="relative flex h-screen w-full overflow-hidden text-white">
      <AmbientBackground />

      <div className="relative z-10 flex h-screen w-full">
        <Sidebar />

        <div className="relative flex flex-1 flex-col overflow-hidden">
          <Topbar title={title} />

          <main className="flex-1 overflow-y-auto p-6">
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

      <WelcomeModal />
    </div>
  )
}