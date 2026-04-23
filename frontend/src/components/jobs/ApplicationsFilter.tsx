import { motion } from 'framer-motion'
import { Search, Plus, SlidersHorizontal, Archive } from 'lucide-react'
import { ApplicationStage } from '../../types'
import { STAGE_LABEL, cn } from '../../lib/utils'

interface Props {
  search:          string
  onSearch:        (v: string) => void
  stageFilter:     number | null
  onStageFilter:   (v: number | null) => void
  showArchived:    boolean
  onToggleArchived: () => void
  onAdd:           () => void
}

const ALL_STAGES = Object.entries(STAGE_LABEL) as [string, string][]

// ── Custom stage dropdown ─────────────────────────────────────
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'

function StageDropdown({
  value, onChange,
}: {
  value: number | null
  onChange: (v: number | null) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const label = value !== null ? STAGE_LABEL[value as ApplicationStage] : 'All stages'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input-glass flex items-center gap-2 min-w-[160px] justify-between"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-slate-500" />
          <span className="text-sm">{label}</span>
        </div>
        <ChevronDown size={14} className={cn('text-slate-500 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 left-0 z-30 glass rounded-xl border border-white/10 shadow-card overflow-hidden min-w-[160px]"
          >
            <button
              onClick={() => { onChange(null); setOpen(false) }}
              className={cn(
                'w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors',
                value === null
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-slate-300 hover:bg-white/[0.06]',
              )}
            >
              All stages
            </button>
            {ALL_STAGES.map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => { onChange(Number(val)); setOpen(false) }}
                className={cn(
                  'w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors',
                  value === Number(val)
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-slate-300 hover:bg-white/[0.06]',
                )}
              >
                {lbl}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ApplicationsFilter({
  search, onSearch, stageFilter, onStageFilter,
  showArchived, onToggleArchived, onAdd,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">

      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search company or role…"
          className="input-glass pl-10 w-full"
        />
      </div>

      {/* Stage filter */}
      <StageDropdown value={stageFilter} onChange={onStageFilter} />

      {/* Archive toggle */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onToggleArchived}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
          showArchived
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            : 'btn-ghost',
        )}
      >
        <Archive size={14} />
        {showArchived ? 'Hide Archived' : 'Show Archived'}
      </motion.button>

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