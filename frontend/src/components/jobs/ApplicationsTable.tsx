import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, Archive, ExternalLink, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { JobApplication } from '../../types'
import { EMPLOYMENT_LABEL, timeAgo, cn } from '../../lib/utils'
import { StageBadge } from '../common/StageBadge'

interface RowActionsProps {
  app:       JobApplication
  onEdit:    () => void
  onDelete:  () => void
  onArchive: () => void
}

function RowActions({ app, onEdit, onDelete, onArchive }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
      {app.jobUrl && (
        <button
          onClick={(e) => { e.stopPropagation(); window.open(app.jobUrl, '_blank'); }}
          className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md transition-colors"
          title="Open Listing"
        >
          <ExternalLink size={14} />
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/10 rounded-md transition-colors"
        title="Edit"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onArchive(); }}
        className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
        title={app.isArchived ? 'Unarchive' : 'Archive'}
      >
        <Archive size={14} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// Fixed: `w-${w}` was built at runtime, which Tailwind's compiler can't see at
// build time — those width utilities were never generated. Inline style avoids
// depending on the purge scan entirely.
const SKELETON_WIDTHS = [112, 96, 80, 64, 64, 56, 56, 96]

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {SKELETON_WIDTHS.map((w, i) => (
        <td key={i} className="py-3.5 px-4">
          <div className="h-4 rounded bg-white/[0.05]" style={{ width: w }} />
        </td>
      ))}
    </tr>
  )
}

interface Props {
  applications: JobApplication[]
  isLoading:    boolean
  onEdit:       (app: JobApplication) => void
  onDelete:     (id: number) => void
  onArchive:    (id: number) => void
}

export default function ApplicationsTable({
  applications, isLoading, onEdit, onDelete, onArchive,
}: Props) {
  const navigate = useNavigate()

  return (
    <div className="glass rounded-2xl overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Company', 'Role', 'Location', 'Stage', 'Type', 'Applied', 'Updated', ''].map(h => (
              <th key={h}
                  className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 py-3 px-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : applications.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-14 text-slate-500 text-sm">
                No applications found.
              </td>
            </tr>
          ) : (
            <AnimatePresence mode="popLayout">
              {applications.map((app, i) => (
                <motion.tr
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 8  }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  onClick={() => navigate(`/app/applications/${app.id}`)}
                  className={cn(
                    'border-b border-white/[0.04] last:border-0 transition-colors group cursor-pointer',
                    'hover:bg-white/[0.02]',
                    app.isArchived && 'opacity-50',
                  )}
                >
                  <td className="py-3.5 px-4 max-w-[200px]">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-slate-300">
                          {app.companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-200 leading-snug">
                        {app.companyName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px]">
                    <span className="text-sm text-slate-400 group-hover:text-cyan-400 transition-colors leading-snug block">
                      {app.jobTitle ?? '—'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {app.location ? (
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin size={12} className="text-slate-500 shrink-0" />
                        <span className="truncate max-w-[120px]">{app.location}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <StageBadge stage={app.currentStage} />
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-500">
                      {EMPLOYMENT_LABEL[app.employmentType] || 'Full Time'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-xs font-mono text-slate-500">
                      {timeAgo(app.appliedAt)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-xs font-mono text-slate-500">
                      {timeAgo(app.lastUpdatedAt)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <RowActions
                      app={app}
                      onEdit={() => onEdit(app)}
                      onDelete={() => onDelete(app.id)}
                      onArchive={() => onArchive(app.id)}
                    />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </div>
  )
}