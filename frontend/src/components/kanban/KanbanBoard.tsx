import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useState } from 'react'
import type { JobApplication, ApplicationStage } from '../../types'
import { STAGE_ORDER } from '../../lib/utils'
import KanbanColumn from './KanbanColumn'
import KanbanCard   from './KanbanCard'

interface Props {
  applications:  JobApplication[]
  onStageChange: (appId: number, newStage: ApplicationStage) => void
}

export default function KanbanBoard({ applications, onStageChange }: Props) {
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find(a => a.id === event.active.id)
    setActiveApp(app ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveApp(null)
    if (!over) return

    const appId  = active.id as number
    const overId = over.id

    let newStage: ApplicationStage | null = null

    if (typeof overId === 'string' && overId.startsWith('col-')) {
      newStage = parseInt(overId.replace('col-', '')) as ApplicationStage
    } else {
      const targetApp = applications.find(a => a.id === overId)
      if (targetApp) newStage = targetApp.currentStage
    }

    if (newStage === null) return

    const draggedApp = applications.find(a => a.id === appId)
    if (!draggedApp) return

    if (draggedApp.currentStage !== newStage) {
      onStageChange(appId, newStage)
    }
  }

  const byStage = STAGE_ORDER.reduce<Record<number, JobApplication[]>>(
    (acc, stage) => {
      acc[stage] = applications.filter(
        a => a.currentStage === stage && !a.isArchived,
      )
      return acc
    },
    {},
  )

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative -mx-6">
        {/* Edge fades — hint that the board scrolls now that there are 6 lanes */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-surface-base to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-surface-base to-transparent" />

        <div className="flex min-h-[calc(100vh-200px)] gap-4 overflow-x-auto px-6 pb-6">
          {STAGE_ORDER.map(stage => (
            <KanbanColumn
              key={stage}
              stage={stage}
              applications={byStage[stage] ?? []}
            />
          ))}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
        {activeApp && <KanbanCard app={activeApp} overlay />}
      </DragOverlay>
    </DndContext>
  )
}