import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "../../lib/utils";
import { NAV_ITEMS } from "./navConfig";

const EASE = [0.16, 1, 0.3, 1] as const;

function NavItem({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
}) {
  return (
    <NavLink to={to} className="group relative block">
      {({ isActive }) => (
        <>
          <motion.div
            whileHover={{ scale: 1.01, x: isActive ? 0 : 3 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex cursor-pointer select-none items-center gap-3.5 overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
              collapsed && "justify-center px-0",
              isActive
                ? "font-bold text-white shadow-sm"
                : "text-slate-400 hover:bg-white/[0.03] hover:text-white"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active-pill"
                className="absolute inset-0 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 via-violet-500/15 to-transparent shadow-[0_0_25px_rgba(34,211,238,0.25)] backdrop-blur-md"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}

            <Icon
              size={19}
              className={cn(
                "relative z-10 shrink-0 transition-transform duration-300 group-hover:scale-110",
                isActive
                  ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  : "text-slate-400"
              )}
            />

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: EASE }}
                  className="relative z-10 whitespace-nowrap font-display tracking-tight"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            {isActive && !collapsed && (
              <span className="relative z-10 ml-auto h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]" />
            )}
          </motion.div>

          {collapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 whitespace-nowrap opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
              <div className="rounded-xl border border-white/15 bg-[#080910] px-3 py-2 font-mono text-xs font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                {label}
              </div>
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const reduceMotion = useReducedMotion();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <motion.aside
      animate={{
        width: collapsed ? 80 : 280,
      }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 30,
      }}
      className="relative z-40 flex h-screen shrink-0 select-none flex-col justify-between border-r border-white/[0.08] bg-[#06070C]/90 backdrop-blur-3xl"
    >
      <div>
        {/* Header - Padding optimized (px-3.5) to unlock text width */}
        <div className="relative flex h-20 items-center overflow-hidden border-b border-white/[0.08] px-3.5">
          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : {
                    rotate: 180,
                    scale: 1.08,
                  }
            }
            transition={{ duration: 0.45, ease: EASE }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-600 shadow-[0_0_22px_rgba(34,211,238,0.35)]"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3 min-w-0 flex-1 overflow-hidden"
              >
                {/* Scaled to text-[19px] and removed truncate to guarantee clean rendering */}
                <h1 className="whitespace-nowrap font-display text-[19px] font-black leading-none tracking-tight text-white">
                  Job<span className="text-cyan-400">Tracker</span>
                </h1>

                <p className="mt-1.5 whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-400/80">
                  AI Career Assistant
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 px-3 py-6">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="space-y-2 border-t border-white/[0.08] p-3.5">
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5 backdrop-blur-xl",
            collapsed &&
              "justify-center border-transparent bg-transparent p-1.5"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-600 font-display text-sm font-black text-white shadow-[0_0_18px_rgba(34,211,238,.35)] ring-1 ring-white/10">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="min-w-0 flex-1"
              >
                <p className="truncate font-display text-xs font-bold tracking-tight text-white">
                  {user?.fullName || "Software Engineer"}
                </p>
                <p className="truncate font-mono text-[10px] text-cyan-400/80">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{
            scale: 1.02,
            backgroundColor: "rgba(239, 68, 68, 0.15)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-2xl border border-transparent px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-400 transition-all duration-200 hover:border-red-500/30 hover:text-red-400",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </motion.button>
      </div>

      {/* Collapse toggle positioned at top-20 for architectural symmetry */}
      <motion.button
        whileHover={{
          scale: 1.15,
          boxShadow: "0 0 20px rgba(34,211,238,0.6)",
        }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3.5 top-20 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500/30 bg-[#080910] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,.2)] backdrop-blur-xl transition-all"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </motion.button>
    </motion.aside>
  );
}