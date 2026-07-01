import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { JobApplication, ApplicationStage } from '../../types'
import { STAGE_META } from '../common/StageBadge'
import KanbanCard from './KanbanCard'

interface Props {
  stage:        ApplicationStage
  applications: JobApplication[]
}

export default function KanbanColumn({ stage, applications }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${stage}` })
  const meta = STAGE_META[stage]

  return (
    <div className="flex w-[292px] shrink-0 flex-col">

      {/* Column header */}
      <div className="mb-3 flex items-center justify-between px-0.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold"
          style={{ borderColor: `${meta.color}33`, background: `${meta.color}14`, color: meta.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>

        {applications.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.06] font-mono text-[10px] font-bold text-slate-400">
            {applications.length}
          </span>
        )}
      </div>

      {/* Drop zone — a real lane surface with a stage-tinted top cap */}
      <motion.div
        ref={setNodeRef}
        animate={{
          backgroundColor: isOver ? `${meta.color}0F` : 'rgba(255,255,255,0.02)',
          borderColor: isOver ? `${meta.color}40` : 'rgba(255,255,255,0.06)',
          boxShadow: isOver ? `inset 0 0 30px ${meta.color}14` : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
        transition={{ duration: 0.15 }}
        className="relative min-h-[300px] flex-1 space-y-2 overflow-hidden rounded-2xl border p-2.5"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70"
          style={{ background: meta.color }}
        />

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

        {applications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-28 flex-col items-center justify-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-dashed border-white/[0.08]">
              <Plus size={14} className="text-slate-700" />
            </div>
            <p className="text-[11px] text-slate-700">Drop here</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}