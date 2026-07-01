import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Kanban, ListTodo, Folder, Settings } from 'lucide-react'

export interface NavItemConfig {
  to: string
  icon: LucideIcon
  label: string
}

// Single source of truth for primary navigation. Sidebar renders these as
// links; Topbar/AppLayout use the same array to resolve the current page's
// icon and title from the route — so they can't fall out of sync.
export const NAV_ITEMS: NavItemConfig[] = [
  { to: '/app/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/app/kanban',       icon: Kanban,          label: 'Kanban Board' },
  { to: '/app/applications', icon: ListTodo,        label: 'Applications' },
  { to: '/app/Folders',      icon: Folder,          label: 'My Folders'  },
  { to: '/app/settings',     icon: Settings,        label: 'Settings'    },
]