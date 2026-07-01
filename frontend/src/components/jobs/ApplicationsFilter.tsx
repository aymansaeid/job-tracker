import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, SlidersHorizontal, Archive, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { STAGE_ORDER, cn } from '../../lib/utils'
import { STAGE_META } from '../common/StageBadge'

interface Props {
  search:          string
  onSearch:        (v: string) => void
  stageFilter:     number | null
  onStageFilter:   (v: number | null) => void
  showArchived:    boolean
  onToggleArchived: () => void
  onAdd:           () => void
}

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

  const activeMeta = value !== null ? STAGE_META[value as keyof typeof STAGE_META] : null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input-glass flex items-center gap-2 min-w-[170px] justify-between"
      >
        <div className="flex items-center gap-2">
          {activeMeta ? (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: activeMeta.color }} />
          ) : (
            <SlidersHorizontal size={14} className="text-slate-500 shrink-0" />
          )}
          <span className="text-sm">{activeMeta ? activeMeta.label : 'All stages'}</span>
        </div>
        <ChevronDown size={14} className={cn('text-slate-500 transition-transform shrink-0', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="glass-raised absolute top-full mt-1.5 left-0 z-30 rounded-xl overflow-hidden min-w-[170px]"
          >
            <button
              onClick={() => { onChange(null); setOpen(false) }}
              className={cn(
                'w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors flex items-center gap-2',
                value === null ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:bg-white/[0.06]',
              )}
            >
              <SlidersHorizontal size={12} className="shrink-0" />
              All stages
            </button>
            {STAGE_ORDER.map((stage) => {
              const meta = STAGE_META[stage]
              return (
                <button
                  key={stage}
                  onClick={() => { onChange(stage); setOpen(false) }}
                  className={cn(
                    'w-full text-left px-3.5 py-2.5 text-xs font-medium transition-colors flex items-center gap-2',
                    value === stage ? 'bg-white/[0.06]' : 'text-slate-300 hover:bg-white/[0.06]',
                  )}
                  style={value === stage ? { color: meta.color } : undefined}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color }} />
                  {meta.label}
                </button>
              )
            })}
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

      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search company or role…"
          className="input-glass pl-10 w-full"
        />
      </div>

      <StageDropdown value={stageFilter} onChange={onStageFilter} />

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