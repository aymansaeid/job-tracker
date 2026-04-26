import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { JobApplication } from '../../types'
import { EMPLOYMENT_LABEL, timeAgo, cn } from '../../lib/utils'

interface Props {
  app:      JobApplication
  overlay?: boolean
}

export default function KanbanCard({ app, overlay = false }: Props) {
  const navigate = useNavigate()

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
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Spread listeners on the whole card — entire card is draggable
      {...attributes}
      {...listeners}
      className={cn(
        'glass rounded-xl border border-white/[0.09] p-4 touch-none select-none',
        'cursor-grab active:cursor-grabbing',
        'transition-all duration-200 group',
        isDragging && 'opacity-30 scale-[0.98]',
        overlay    && 'shadow-glow-cyan !opacity-100 rotate-[1.5deg] scale-[1.04] cursor-grabbing border-cyan-500/30',
      )}
    >
      {/* ── Top: company + link ───────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Company avatar */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/25 to-violet-500/25 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-slate-200">
              {app.companyName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Company name — click to navigate, stop drag propagation */}
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => navigate(`/app/applications/${app.id}`)}
            className="text-sm font-semibold text-slate-200 hover:text-cyan-400 transition-colors text-left line-clamp-1 cursor-pointer"
          >
            {app.companyName}
          </button>
        </div>

        {/* External link — stop drag */}
        {app.jobUrl && (
          /* FIX: Added the missing <a tag right here! */
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyan-400 shrink-0 mt-0.5"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* ── Job title ─────────────────────────────────── */}
      {app.jobTitle && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {app.jobTitle}
        </p>
      )}

      {/* ── Meta row ──────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-white/[0.06]">
        {app.location && (
          <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin size={9} />
            <span className="truncate max-w-[80px]">{app.location}</span>
          </span>
        )}
        <span className="flex items-center gap-1 text-[10px] text-slate-600 ml-auto">
          <Clock size={9} />
          {timeAgo(app.appliedAt)}
        </span>
      </div>
    </div>
  )
}