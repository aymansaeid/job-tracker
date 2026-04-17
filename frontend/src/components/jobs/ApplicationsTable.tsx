import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, Archive, ExternalLink, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { JobApplication } from '../../types'
import { EMPLOYMENT_LABEL, timeAgo, cn } from '../../lib/utils'
import StageBadge from '../common/StageBadge'

interface RowActionsProps {
  app:       JobApplication
  onEdit:    () => void
  onDelete:  () => void
  onArchive: () => void
}

function RowActions({ app, onEdit, onDelete, onArchive }: RowActionsProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/[0.08] transition-all opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-8 z-20 glass rounded-xl border border-white/10 shadow-card overflow-hidden min-w-[140px]"
            >
              {app.jobUrl && (
                <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors">
                  <ExternalLink size={13} /> Open listing
                </a>
              )}
              <button onClick={() => { onEdit(); setOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors">
                <Pencil size={13} /> Edit
              </button>
              <button onClick={() => { onArchive(); setOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors">
                <Archive size={13} /> {app.isArchived ? 'Unarchive' : 'Archive'}
              </button>
              <div className="border-t border-white/[0.06]" />
              <button onClick={() => { onDelete(); setOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={13} /> Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[28, 24, 16, 16, 14, 8].map((w, i) => (
        <td key={i} className="py-3.5 px-4">
          <div className={`h-4 w-${w} rounded bg-white/[0.05]`} />
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
  return (
    <div className="glass rounded-2xl border border-white/[0.07]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Company', 'Role', 'Stage', 'Type', 'Applied', ''].map(h => (
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
              <td colSpan={6} className="text-center py-14 text-slate-500 text-sm">
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
                  className={cn(
                    'border-b border-white/[0.04] last:border-0 transition-colors group',
                    'hover:bg-white/[0.02]',
                    app.isArchived && 'opacity-50',
                  )}
                >
                  {/* Company */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-300">
                          {app.companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-200 truncate max-w-[120px]">
                        {app.companyName}
                      </span>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <Link to={`/app/applications/${app.id}`}
                          className="text-sm text-slate-400 hover:text-cyan-400 transition-colors truncate max-w-[160px] block">
                      {app.jobTitle ?? '—'}
                    </Link>
                  </td>

                  {/* Stage */}
                  <td className="py-3.5 px-4">
                    <StageBadge stage={app.currentStage} />
                  </td>

                  {/* Employment type */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-500">
                      {EMPLOYMENT_LABEL[app.employmentType]}
                    </span>
                  </td>

                  {/* Applied date */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-500">
                      {timeAgo(app.appliedAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4">
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