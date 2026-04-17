import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { JobApplication } from '../../types'
import { STAGE_LABEL, stageColor, timeAgo, cn } from '../../lib/utils'

// ── Skeleton row ──────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-3 px-4"><div className="h-4 w-28 rounded bg-white/[0.05]" /></td>
      <td className="py-3 px-4"><div className="h-4 w-24 rounded bg-white/[0.04]" /></td>
      <td className="py-3 px-4"><div className="h-5 w-20 rounded-full bg-white/[0.05]" /></td>
      <td className="py-3 px-4"><div className="h-4 w-16 rounded bg-white/[0.04]" /></td>
      <td className="py-3 px-4"><div className="h-4 w-6  rounded bg-white/[0.04]" /></td>
    </tr>
  )
}

// ── Main component ────────────────────────────────────────────

interface Props {
  applications: JobApplication[]
  isLoading:    boolean
}

export default function RecentApplicationsTable({ applications, isLoading }: Props) {
  // Show only the 5 most recently updated
  const recent = [...applications]
    .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
    .slice(0, 5)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Recent Activity
        </h2>
        <Link
          to="/app/applications"
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
        >
          View all →
        </Link>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/[0.07] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Company', 'Role', 'Stage', 'Last Updated', ''].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-600 py-3 px-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500 text-sm">
                  No applications yet.{' '}
                  <Link to="/app/applications" className="text-cyan-400 hover:underline">
                    Add your first one →
                  </Link>
                </td>
              </tr>
            ) : (
              recent.map((app, i) => (
                <motion.tr
                  key={app.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Company */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      {/* Company initials avatar */}
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
                    <span className="text-sm text-slate-400 truncate max-w-[140px] block">
                      {app.jobTitle ?? '—'}
                    </span>
                  </td>

                  {/* Stage badge */}
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      'text-[11px] font-bold px-2.5 py-1 rounded-full border',
                      stageColor(app.currentStage),
                    )}>
                      {STAGE_LABEL[app.currentStage]}
                    </span>
                  </td>

                  {/* Last updated */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-500">
                      {timeAgo(app.lastUpdatedAt)}
                    </span>
                  </td>

                  {/* Link */}
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/app/applications/${app.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyan-400"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}