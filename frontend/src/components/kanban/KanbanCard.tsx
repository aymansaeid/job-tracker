import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MapPin, Briefcase, ExternalLink } from 'lucide-react'
import type { JobApplication } from '../../types'
import { EMPLOYMENT_LABEL, timeAgo } from '../../lib/utils'

interface Props {
  app:      JobApplication
  overlay?: boolean
}

export default function KanbanCard({ app, overlay = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        glass rounded-xl border border-white/10 p-4 cursor-default
        ${isDragging ? 'opacity-40 scale-95' : ''}
        ${overlay   ? 'shadow-glow-cyan rotate-1 scale-105 cursor-grabbing' : ''}
        transition-shadow group
      `}
    >
      <div className="flex items-start gap-2.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-slate-600 hover:text-slate-300 transition-colors cursor-grab active:cursor-grabbing shrink-0 touch-none"
        >
          <GripVertical size={14} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            {/* UPDATED: Removed max-width and truncate, added line-clamp-2 */}
            <p className="text-sm font-semibold text-slate-200 line-clamp-2 pr-2">
              {app.companyName}
            </p>
            {app.jobUrl && (
              <a
                href={app.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyan-400 shrink-0 mt-0.5"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* UPDATED: Changed from <Link> to <p> to prevent routing crashes, added line-clamp-2 */}
          {app.jobTitle && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {app.jobTitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/[0.06]">
        {app.location && (
          <span className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
            <MapPin size={10} />
            {app.location}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 ml-auto shrink-0">
          <Briefcase size={10} />
          {EMPLOYMENT_LABEL[app.employmentType] || 'Full Time'}
        </span>
      </div>

      <p className="text-[10px] text-slate-600 mt-2">
        Applied {timeAgo(app.appliedAt)}
      </p>
    </div>
  )
}