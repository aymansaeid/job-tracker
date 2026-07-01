import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { JobApplication } from '../../types'
import { timeAgo } from '../../lib/utils'
import { StageBadge } from '../common/StageBadge'

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3.5"><div className="h-4 w-28 rounded bg-white/[0.05]" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-24 rounded bg-white/[0.04]" /></td>
      <td className="px-4 py-3.5"><div className="h-5 w-20 rounded-full bg-white/[0.05]" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-16 rounded bg-white/[0.04]" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-6 rounded bg-white/[0.04]" /></td>
    </tr>
  )
}

interface Props {
  applications: JobApplication[]
  isLoading: boolean
}

export default function RecentApplicationsTable({ applications, isLoading }: Props) {
  const recent = [...applications]
    .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
    .slice(0, 5)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Recent Activity
        </h2>
        <Link to="/app/applications" className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300">
          View all →
        </Link>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Company', 'Role', 'Stage', 'Last Updated', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-600">
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
                <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
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
                  className="group border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                        <span className="text-[10px] font-bold text-slate-300">
                          {app.companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="max-w-[120px] truncate text-sm font-medium text-slate-200">
                        {app.companyName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="block max-w-[140px] truncate text-sm text-slate-400">
                      {app.jobTitle ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StageBadge stage={app.currentStage} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-slate-500">{timeAgo(app.lastUpdatedAt)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      to={`/app/applications/${app.id}`}
                      className="text-slate-500 opacity-0 transition-opacity hover:text-cyan-400 group-hover:opacity-100"
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