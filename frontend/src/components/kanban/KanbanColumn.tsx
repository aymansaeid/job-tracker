import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { JobApplication, ApplicationStage } from '../../types'
import { STAGE_LABEL, stageColor, cn } from '../../lib/utils'
import KanbanCard from './KanbanCard'

// Column accent colors beyond the badge
const COLUMN_GLOW: Record<number, string> = {
  0: 'rgba(59,130,246,0.06)',   // Applied   — blue
  2: 'rgba(139,92,246,0.06)',   // Interview — violet
  3: 'rgba(16,185,129,0.06)',   // Offer     — emerald
  4: 'rgba(239,68,68,0.06)',    // Rejected  — red
  5: 'rgba(100,116,139,0.06)',  // Ghosted   — slate
}

interface Props {
  stage:        ApplicationStage
  applications: JobApplication[]
}

export default function KanbanColumn({ stage, applications }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${stage}` })
  const colorClass = stageColor(stage)

  return (
    <div className="flex flex-col w-[280px] shrink-0">

      {/* ── Column header ──────────────────────────────── */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <span className={cn(
          'text-[11px] font-bold px-3 py-1.5 rounded-full border',
          colorClass,
        )}>
          {STAGE_LABEL[stage]}
        </span>

        <div className="flex items-center gap-2">
          {applications.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.09] flex items-center justify-center text-[10px] font-bold text-slate-400">
              {applications.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Drop zone ──────────────────────────────────── */}
      <motion.div
        ref={setNodeRef}
        animate={{
          backgroundColor: isOver
            ? COLUMN_GLOW[stage] ?? 'rgba(34,211,238,0.05)'
            : 'rgba(255,255,255,0.015)',
          borderColor: isOver
            ? 'rgba(34,211,238,0.25)'
            : 'rgba(255,255,255,0.05)',
          boxShadow: isOver
            ? 'inset 0 0 30px rgba(34,211,238,0.04)'
            : 'none',
        }}
        transition={{ duration: 0.15 }}
        className="flex-1 rounded-2xl border border-dashed p-2 space-y-2 min-h-[300px]"
      >
        <SortableContext
          items={applications.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {applications.map((app, i) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <KanbanCard app={app} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Empty state */}
        {applications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-28 gap-2"
          >
            <div className="w-8 h-8 rounded-xl border border-dashed border-white/[0.08] flex items-center justify-center">
              <Plus size={14} className="text-slate-700" />
            </div>
            <p className="text-[11px] text-slate-700">Drop here</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}