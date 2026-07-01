import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Kanban, ListTodo, Settings,
  Sparkles, LogOut, ChevronLeft, ChevronRight,  Folder
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/app/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/app/kanban',       icon: Kanban,          label: 'Kanban Board' },
  { to: '/app/applications', icon: ListTodo,        label: 'Applications' },
  { to: '/app/Folders',           icon: Folder,           label: 'My Folders' },
  { to: '/app/settings',     icon: Settings,        label: 'Settings'     },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate  = useNavigate()
  const logout    = useAuthStore((s) => s.logout)
  const user      = useAuthStore((s) => s.user)
console.log("USER DATA:", user);
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative flex flex-col h-screen glass border-r border-white/[0.07] shrink-0 overflow-hidden z-40"
    >

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-white/[0.07] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="font-display font-bold text-white text-base whitespace-nowrap"
            >
              JobTracker
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent',
                )}
              >
                <Icon size={18} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-2 py-4 border-t border-white/[0.07] space-y-1 shrink-0">

        {/* User info */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl',
          collapsed ? 'justify-center' : '',
        )}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.fullName || 'user name not found '}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ x: 2 }}
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200',
            collapsed ? 'justify-center' : '',
          )}
        >
          <LogOut size={17} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Collapse toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCollapsed(v => !v)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full glass border border-white/15 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-50"
      >
        {collapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft  size={12} />
        }
      </motion.button>

    </motion.aside>
  )
}