import { motion } from 'framer-motion'
import {
  Building2, MapPin, Briefcase, Calendar,
  ExternalLink, Archive, Trash2, StickyNote
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
  icon: Icon, label, value, href,
}: {
  icon:   React.ElementType
  label:  string
  value:  string | undefined | null
  href?:  string
}) {
  if (!value) return null

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-400" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-0.5">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 break-all"
          >
            {value}
            <ExternalLink size={11} />
          </a>
        ) : (
          <p className="text-sm text-slate-300 break-words">{value}</p>
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
        className="glass rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">

          {/* Left — company + title + badge */}
          <div className="flex items-start gap-4">
            {/* Company avatar */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-xl text-slate-200">
                {app.companyName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-white mb-1">
                {app.companyName}
              </h2>
              {app.jobTitle && (
                <p className="text-slate-400 text-sm mb-2">{app.jobTitle}</p>
              )}
              <StageBadge stage={app.currentStage} />
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onEdit}
              className="btn-primary py-2 px-4 text-xs"
            >
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onArchive}
              className="btn-ghost py-2 px-3 text-xs flex items-center gap-1.5"
            >
              <Archive size={13} />
              {app.isArchived ? 'Unarchive' : 'Archive'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onDelete}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-white/[0.07] transition-all"
            >
              <Trash2 size={15} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Details grid ───────────────────────────────────── */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible" custom={1}
        className="glass rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-5">
          Details
        </h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <DetailRow
            icon={Building2}
            label="Company"
            value={app.companyName}
          />
          <DetailRow
            icon={Briefcase}
            label="Employment Type"
            value={EMPLOYMENT_LABEL[app.employmentType] || 'Full Time'}
          />
          <DetailRow
            icon={MapPin}
            label="Location"
            value={app.location}
          />
          <DetailRow
            icon={Calendar}
            label="Applied"
            value={new Date(app.appliedAt).toLocaleDateString('en-US', {
              weekday: 'short', year: 'numeric',
              month: 'long', day: 'numeric',
            })}
          />
          <DetailRow
            icon={ExternalLink}
            label="Job Listing"
            value={app.jobUrl ? 'Open listing' : null}
            href={app.jobUrl}
          />
          <DetailRow
            icon={Calendar}
            label="Last Updated"
            value={timeAgo(app.lastUpdatedAt)}
          />
        </div>
      </motion.div>

      {/* ── Notes ──────────────────────────────────────────── */}
      {app.notes && (
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={2}
          className="glass rounded-2xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <StickyNote size={14} className="text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Notes
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {app.notes}
          </p>
        </motion.div>
      )}

    </div>
  )
}