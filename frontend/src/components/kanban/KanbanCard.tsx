import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MapPin, Clock, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { JobApplication } from '../../types'
import { timeAgo, cn } from '../../lib/utils'
import { STAGE_META } from '../common/StageBadge'

interface Props {
  app: JobApplication
  overlay?: boolean
}

export default function KanbanCard({ app, overlay = false }: Props) {
  const navigate = useNavigate()

  const meta = STAGE_META[app.currentStage] ?? {
    color: '#06b6d4',
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(overlay
      ? {
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px -8px ${meta.color}55, 0 0 0 1px ${meta.color}4D`,
        }
      : {}),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'glass group relative touch-none select-none overflow-hidden rounded-xl p-4',
        'cursor-grab transition-all duration-200 active:cursor-grabbing',
        isDragging && 'scale-[0.98] opacity-30',
        overlay && '!opacity-100 scale-[1.04] rotate-[1.5deg] cursor-grabbing',
      )}
    >
      {/* Stage accent rail */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
        style={{
          background: meta.color,
          opacity: 0.7,
        }}
      />

      <div className="mb-2.5 flex items-start justify-between gap-2 pl-1.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-cyan-500/25 to-violet-500/25">
            <span className="text-[11px] font-bold text-slate-200">
              {app.companyName.charAt(0).toUpperCase()}
            </span>
          </div>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => navigate(`/app/applications/${app.id}`)}
            className="line-clamp-1 cursor-pointer text-left text-sm font-semibold text-slate-200 transition-colors hover:text-cyan-400"
          >
            {app.companyName}
          </button>
        </div>

        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 shrink-0 text-slate-500 opacity-0 transition-opacity hover:text-cyan-400 group-hover:opacity-100"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {app.jobTitle && (
        <p className="mb-3 line-clamp-2 pl-1.5 text-xs leading-relaxed text-slate-400">
          {app.jobTitle}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pl-1.5 pt-2.5">
        {app.location && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin size={9} />
            <span className="max-w-[80px] truncate">{app.location}</span>
          </span>
        )}

        <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-slate-600">
          <Clock size={9} />
          {timeAgo(app.appliedAt)}
        </span>
      </div>
    </div>
  )
}