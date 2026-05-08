import { motion } from 'framer-motion'
import { FileText, Award, File } from 'lucide-react'
import { cn } from '../../lib/utils'

const CATEGORY_MAP = { RESUME: 1, CERTIFICATE: 2, IMPORTANT: 3 }

const tabs = [
  { id: CATEGORY_MAP.RESUME, label: 'CVs', icon: FileText },
  { id: CATEGORY_MAP.CERTIFICATE, label: 'Certificates', icon: Award },
  { id: CATEGORY_MAP.IMPORTANT, label: 'Important', icon: File },
]

interface VaultTabsProps {
  activeTab: number
  setActiveTab: (id: number) => void
}

export default function VaultTabs({ activeTab, setActiveTab }: VaultTabsProps) {
  return (
    <div className="glass p-1 rounded-xl border border-white/[0.06] inline-flex">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative flex items-center justify-center px-4 py-2 text-xs font-bold tracking-wide rounded-lg transition-colors z-10',
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="vaultTabBubble"
                className="absolute inset-0 bg-white/[0.08] rounded-lg border border-white/10 shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon size={14} className={isActive ? 'text-cyan-400' : ''} />
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}