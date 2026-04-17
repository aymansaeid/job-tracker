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
  applications: JobApplication[]
  onStageChange: (appId: number, newStage: ApplicationStage) => void
}

export default function KanbanBoard({ applications, onStageChange }: Props) {
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag starts — prevents accidental drags
      activationConstraint: { distance: 8 },
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

    const appId = active.id as number
    const overId = over.id

    let newStage: ApplicationStage | null = null

    // SAFE CHECK: Did they drop it directly on a column? (e.g., 'col-1')
    if (typeof overId === 'string' && overId.startsWith('col-')) {
      newStage = parseInt(overId.replace('col-', '')) as ApplicationStage
    } else {
      // SAFE CHECK: Dropped on another card — find that card's stage
      const targetApp = applications.find(a => a.id === overId)
      if (targetApp) newStage = targetApp.currentStage
    }

    if (newStage === null) return

    const draggedApp = applications.find(a => a.id === appId)
    if (!draggedApp) return

    // Only update if stage actually changed
    if (draggedApp.currentStage !== newStage) {
      onStageChange(appId, newStage)
    }
  }

  // Group applications by stage using our new Ghosted/InReview enum mapping
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
      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {STAGE_ORDER.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applications={byStage[stage] ?? []}
          />
        ))}
      </div>

      {/* Drag overlay — rendered on top of everything while dragging */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeApp && <KanbanCard app={activeApp} overlay />}
      </DragOverlay>
    </DndContext>
  )
}