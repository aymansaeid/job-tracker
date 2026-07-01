import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'
import { NAV_ITEMS } from './navConfig'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

function NavItem({
  to, icon: Icon, label, collapsed,
}: {
  to: string
  icon: LucideIcon
  label: string
  collapsed: boolean
}) {
  return (
    <NavLink to={to} className="group relative block">
      {({ isActive }) => (
        <>
          <motion.div
            whileHover={{ x: isActive ? 0 : 2 }}
            className={cn(
              'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer',
              collapsed && 'justify-center px-0',
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/15 to-violet-500/10"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <Icon size={18} className={cn('relative z-10 shrink-0', isActive && 'text-cyan-400')} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive && !collapsed && (
              <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
          </motion.div>

          {/* Collapsed state: the label doesn't disappear, it becomes a flyout */}
          {collapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <div className="glass-raised rounded-lg px-3 py-1.5 text-xs font-medium text-white">
                {label}
              </div>
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const reduceMotion = useReducedMotion()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="glass relative z-40 flex h-screen shrink-0 flex-col overflow-hidden border-r border-white/[0.07]"
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[80px]" />

      {/* Logo */}
      <div className="relative flex h-16 shrink-0 items-center gap-2.5 border-b border-white/[0.07] px-4">
        <motion.div
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500"
          animate={reduceMotion ? undefined : {
            boxShadow: [
              '0 0 0px rgba(34,211,238,0.4)',
              '0 0 16px rgba(34,211,238,0.4)',
              '0 0 0px rgba(34,211,238,0.4)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={15} className="text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="whitespace-nowrap font-display text-base font-bold text-white"
            >
              JobTracker
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 space-y-1 overflow-hidden px-2 py-4">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User + logout */}
      <div className="relative space-y-1 border-t border-white/[0.07] px-2 py-4">
        <div className={cn('group relative flex items-center gap-3 rounded-xl px-3 py-2.5', collapsed && 'justify-center px-0')}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500">
            <span className="text-xs font-bold text-white">
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
                className="min-w-0 flex-1"
              >
                <p className="truncate text-xs font-semibold text-slate-200">
                  {user?.fullName || 'User'}
                </p>
                <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <div className="glass-raised rounded-lg px-3 py-1.5 text-xs font-medium text-white">
                {user?.fullName || 'User'}
              </div>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ x: collapsed ? 0 : 2 }}
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400',
            collapsed && 'justify-center px-0',
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
        onClick={() => setCollapsed((v) => !v)}
        className="glass-raised absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-white"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </motion.button>
    </motion.aside>
  )
}