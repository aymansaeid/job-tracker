import { motion } from 'framer-motion'
import {
  Building2, MapPin, Briefcase, Calendar,
  ExternalLink, Archive, Trash2, StickyNote, Pencil, Mail
} from 'lucide-react'
import type { JobApplication } from '../../types'
import { EMPLOYMENT_LABEL, timeAgo } from '../../lib/utils'
import StageBadge from '../common/StageBadge'

interface Props {
  app:       JobApplication
  onEdit:    () => void
  onDelete:  () => void
  onArchive: () => void
}

const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.07 },
  }),
}


function DetailRow({
  icon: Icon, label, value, href, fallback = 'Not specified'
}: {
  icon:      React.ElementType
  label:     string
  value?:    string | null
  href?:     string | null
  fallback?: string
}) {
  const hasValue = value && value.trim() !== ''

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className={hasValue ? "text-cyan-400" : "text-slate-600"} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
          {label}
        </p>
        {!hasValue ? (
          <p className="text-sm text-slate-600 italic">{fallback}</p>
        ) : href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 truncate block"
            title={value}
          >
            <span className="truncate">{value}</span>
            <ExternalLink size={11} className="shrink-0" />
          </a>
        ) : (
          <p className="text-sm text-slate-200 truncate" title={value}>{value}</p>
        )}
      </div>
    </div>
  )
}

export default function ApplicationDetail({
  app, onEdit, onDelete, onArchive,
}: Props) {
  return (
    <div className="space-y-6">

      {/* ── Header card ────────────────────────────────────── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={0}
        className="glass rounded-2xl border border-white/10 p-6 relative overflow-hidden"
      >
        {/* Subtle background glow based on archive state */}
        <div className={`absolute -right-20 -top-20 w-64 h-64 blur-3xl opacity-10 pointer-events-none rounded-full ${app.isArchived ? 'bg-amber-500' : 'bg-cyan-500'}`} />

        <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">

          {/* Left — company + title + badge */}
          <div className="flex items-center gap-5">
            {/* Premium Company Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
              <span className="font-display font-bold text-2xl text-slate-200">
                {app.companyName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <h2 className="font-display text-2xl font-bold text-white mb-1.5 tracking-tight">
                {app.companyName}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">
                  {app.jobTitle ?? 'Unknown Role'}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <StageBadge stage={app.currentStage} />
              </div>
            </div>
          </div>

          {/* Right — UX Enhanced Actions */}
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-xl">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              <Pencil size={14} /> Edit
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={onArchive}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                app.isArchived 
                  ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' 
                  : 'text-slate-300 hover:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Archive size={14} /> {app.isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Delete Application"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Details grid ───────────────────────────────────── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={1}
        className="glass rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-6 flex items-center gap-2">
          <Briefcase size={14} className="text-slate-400" />
          Application Details
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
          <DetailRow
            icon={Building2}
            label="Company"
            value={app.companyName}
          />
          <DetailRow
            icon={Briefcase}
            label="Employment Type"
            value={EMPLOYMENT_LABEL[app.employmentType]}
            fallback="Full Time"
          />
          <DetailRow
            icon={MapPin}
            label="Location"
            value={app.location}
            fallback="Remote / Unspecified"
          />
          <DetailRow
            icon={ExternalLink}
            label="Job Listing"
            value={app.jobUrl ? 'View Original Posting' : null}
            href={app.jobUrl}
          />
          <DetailRow
            icon={Calendar}
            label="Date Applied"
            value={new Date(app.appliedAt).toLocaleDateString('en-US', {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            })}
          />
          <DetailRow
            icon={Calendar}
            label="Last Activity"
            value={timeAgo(app.lastUpdatedAt)}
          />
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Notes ──────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="glass rounded-2xl border border-white/10 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
              <StickyNote size={14} className="text-slate-400" />
              Personal Notes
            </h3>
            {!app.notes && (
              <button onClick={onEdit} className="text-xs text-cyan-400 hover:underline">
                Add note
              </button>
            )}
          </div>
          
          {app.notes ? (
            <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono text-opacity-90">
                {app.notes}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-white/[0.01] border border-white/[0.03] border-dashed rounded-xl">
              <StickyNote size={24} className="text-slate-600 mb-2" />
              <p className="text-sm text-slate-500">No notes recorded.</p>
            </div>
          )}
        </motion.div>

        {/* ── AI Linked Emails ───────────────────────────────── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={3}
          className="glass rounded-2xl border border-white/10 p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              Linked Communications
            </h3>
          </div>

          {app.linkedEmails && app.linkedEmails.length > 0 ? (
            <div className="space-y-3">
              {app.linkedEmails.map((email: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <p className="text-sm text-slate-200 font-medium truncate">{email.subject ?? 'Email Thread'}</p>
                  <p className="text-xs text-slate-500 mt-1">Detected by AI Sync</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-white/[0.01] border border-white/[0.03] border-dashed rounded-xl">
              <Mail size={24} className="text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 px-4">
                No emails linked yet. Ensure Gmail is connected to automatically track updates.
              </p>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  )
}