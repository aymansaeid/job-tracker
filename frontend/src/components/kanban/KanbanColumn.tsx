import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import type { JobApplication, ApplicationStage } from '../../types'
import { STAGE_LABEL, stageColor, cn } from '../../lib/utils'
import KanbanCard from './KanbanCard'

interface Props {
  stage:        ApplicationStage
  applications: JobApplication[]
}

export default function KanbanColumn({ stage, applications }: Props) {
  // FIX: Prefix the column ID so it doesn't collide with database IDs
  const { setNodeRef, isOver } = useDroppable({ id: `col-${stage}` })

  const colorClass = stageColor(stage)

  return (
<div className="flex flex-col min-w-[300px] w-[300px]">
    
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-[10px] font-bold px-2.5 py-1 rounded-full border',
            colorClass,
          )}>
            {STAGE_LABEL[stage]}
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <motion.div
        ref={setNodeRef}
        animate={{
          backgroundColor: isOver
            ? 'rgba(34, 211, 238, 0.05)'
            : 'rgba(255,255,255,0.02)',
          borderColor: isOver
            ? 'rgba(34, 211, 238, 0.3)'
            : 'rgba(255,255,255,0.06)',
        }}
        transition={{ duration: 0.15 }}
        className="flex-1 rounded-2xl border border-dashed p-2 space-y-2.5 min-h-[200px]"
      >
        <SortableContext
          items={applications.map(a => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {applications.map(app => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 8  }}
                animate={{ opacity: 1, y: 0  }}
                exit={{    opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <KanbanCard app={app} />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Empty state */}
        {applications.length === 0 && (
          <div className="flex items-center justify-center h-24">
            <p className="text-[11px] text-slate-700">Drop here</p>
          </div>
        )}
      </motion.div>

    </div>
  )
}