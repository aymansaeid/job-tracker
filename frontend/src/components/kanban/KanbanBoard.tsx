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
      // 5px threshold — short enough to feel responsive, prevents accidental drags on clicks
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

    // Dropped on a column droppable (id format: 'col-{stage}')
    if (typeof overId === 'string' && overId.startsWith('col-')) {
      newStage = parseInt(overId.replace('col-', '')) as ApplicationStage
    } else {
      // Dropped on another card — use that card's stage
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

  // Group by stage, exclude archived
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
      <div className="flex gap-3 overflow-x-auto pb-6 -mx-6 px-6 min-h-[calc(100vh-200px)]">
        {STAGE_ORDER.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applications={byStage[stage] ?? []}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
        {activeApp && <KanbanCard app={activeApp} overlay />}
      </DragOverlay>
    </DndContext>
  )
}