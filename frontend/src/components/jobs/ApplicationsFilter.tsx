import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { STAGE_LABEL } from '../../lib/utils'

interface Props {
  search:        string
  onSearch:      (v: string) => void
  stageFilter:   number | null
  onStageFilter: (v: number | null) => void
  onAdd:         () => void
}

const ALL_STAGES = Object.entries(STAGE_LABEL) as [string, string][]

export default function ApplicationsFilter({
  search, onSearch, stageFilter, onStageFilter, onAdd,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedLabel = stageFilter !== null 
    ? STAGE_LABEL[stageFilter as keyof typeof STAGE_LABEL] 
    : 'All stages'

  return (
    <div className="flex flex-col sm:flex-row gap-3">

      {/* Search */}
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search company or role…"
          className="input-glass pl-10 w-full"
        />
      </div>

      {/* Custom Stage Filter Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="input-glass pl-10 pr-4 flex items-center justify-between min-w-[160px] w-full sm:w-auto h-full text-sm text-slate-200 transition-colors hover:bg-white/[0.04]"
        >
          <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <span>{selectedLabel}</span>
          <ChevronDown size={14} className={`text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-[calc(100%+8px)] z-30 w-full min-w-[160px] glass rounded-xl border border-white/10 shadow-card py-1.5"
            >
              <button
                onClick={() => { onStageFilter(null); setDropdownOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/[0.06] ${
                  stageFilter === null ? 'text-cyan-400 font-medium' : 'text-slate-300'
                }`}
              >
                All stages
              </button>
              {ALL_STAGES.map(([val, label]) => {
                const numVal = Number(val)
                return (
                  <button
                    key={val}
                    onClick={() => { onStageFilter(numVal); setDropdownOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/[0.06] ${
                      stageFilter === numVal ? 'text-cyan-400 font-medium' : 'text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add button */}
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAdd}
        className="btn-primary flex items-center gap-2 px-5 py-2.5 whitespace-nowrap"
      >
        <Plus size={16} />
        Add Application
      </motion.button>

    </div>
  )
}