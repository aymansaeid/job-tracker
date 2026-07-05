import { motion } from 'framer-motion'
import {
  Building2, MapPin, Briefcase, Calendar,
  ExternalLink, Archive, Trash2, StickyNote, Pencil, Mail, Sparkles
} from 'lucide-react'
import type { JobApplication } from '../../types'
import { EMPLOYMENT_LABEL, timeAgo } from '../../lib/utils'
import { StageBadge } from '../common/StageBadge'

interface Props {
  app: JobApplication
  onEdit: () => void
  onDelete: () => void
  onArchive: () => void
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07 },
  }),
}

function DetailRow({
  icon: Icon,
  label,
  value,
  href,
  fallback = 'Not specified',
}: {
  icon: React.ElementType
  label: string
  value?: string | null
  href?: string | null
  fallback?: string
}) {
  const hasValue = !!value && value.trim() !== ''

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className={hasValue ? 'text-cyan-400' : 'text-slate-600'} />
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
            title={value ?? ''}
          >
            <span className="truncate">{value}</span>
            <ExternalLink size={11} className="shrink-0" />
          </a>
        ) : (
          <p className="text-sm text-slate-200 truncate" title={value ?? ''}>
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

// Helper to intelligently parse AI notes and turn links into rich components
function SmartNotesRenderer({ notes }: { notes: string }) {
  if (!notes) return null;

  // Split lines to isolate AI links from human/reasoning metadata
  const lines = notes.split('\n');

  return (
    <div className="space-y-3 w-full">
      {lines.map((line, idx) => {
        const isUrlLine = line.includes('[AI Extracted Link]:');
        const isNotesLine = line.includes('[AI Notes]:');

        if (isUrlLine) {
          const url = line.replace('[AI Extracted Link]:', '').trim();
          return (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-cyan-500/10 bg-cyan-500/[0.02] shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400/80">
                <Sparkles size={13} className="text-cyan-400 animate-pulse" /> Origin Payload URL
              </div>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1.5 rounded-lg transition-all truncate max-w-full sm:max-w-[280px] md:max-w-[400px]"
              >
                <ExternalLink size={12} className="shrink-0" />
                <span className="truncate">Open Listing URL</span>
              </a>
            </div>
          );
        }

        if (isNotesLine) {
          const text = line.replace('[AI Notes]:', '').trim();
          return (
            <div key={idx} className="text-sm text-slate-300 leading-relaxed font-sans mt-1">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500 block mb-1">AI Context Summary</span>
              {text}
            </div>
          );
        }

        // Return standard text formatting for manual user notes with clean line break wrap security
        return line.trim() ? (
          <p key={idx} className="text-sm text-slate-300 break-words whitespace-pre-wrap font-sans leading-relaxed">
            {line}
          </p>
        ) : null;
      })}
    </div>
  );
}

export default function ApplicationDetail({ app, onEdit, onDelete, onArchive }: Props) {
  return (
    <div className="space-y-6">

      {/* HEADER WITH SLOW-MOTION BORDER GLOW */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative overflow-hidden rounded-2xl p-[1px]"
      >
        <motion.div
          className="pointer-events-none absolute inset-[-100%] z-0 opacity-40"
          style={{
            background: 'conic-gradient(from 0deg, transparent 75%, rgba(34, 211, 238, 0.3) 85%, rgba(139, 92, 246, 0.7) 95%, rgba(236, 72, 153, 1) 100%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />

        <div className="relative z-10 glass h-full w-full rounded-2xl p-6 bg-slate-950/80 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
            <div className="flex items-center gap-5">
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
                  <span className="text-slate-400 font-medium text-sm">
                    {app.jobTitle ?? 'Unknown Role'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <StageBadge stage={app.currentStage} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-xl">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <Pencil size={14} /> Edit
              </button>

              <div className="w-px h-4 bg-white/10 mx-1" />

              <button
                onClick={onArchive}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  app.isArchived
                    ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                    : 'text-slate-300 hover:text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Archive size={14} />
                {app.isArchived ? 'Unarchive' : 'Archive'}
              </button>

              <div className="w-px h-4 bg-white/10 mx-1" />

              <button
                onClick={onDelete}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* DETAILS CARD */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
        className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden"
      >
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-6 flex items-center gap-2">
          <Briefcase size={14} className="text-slate-400" />
          Application Details
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6">
          <DetailRow icon={Building2} label="Company" value={app.companyName} />
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
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          />
          <DetailRow
            icon={Calendar}
            label="Last Activity"
            value={timeAgo(app.lastUpdatedAt)}
          />
        </div>
      </motion.div>

      {/* NOTES AND COMMUNICATIONS BOUNDS - LOCKED FOR OVERFLOW PROTECTION */}
      <div className="grid md:grid-cols-2 gap-6 min-w-0">
        
        {/* PERSONAL NOTES BOX */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="glass rounded-2xl p-6 flex flex-col border border-white/10 min-w-0 w-full overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
              <StickyNote size={14} />
              Personal Notes
            </h3>
            {!app.notes && (
              <button onClick={onEdit} className="text-xs text-cyan-400 font-bold hover:underline">
                Add note
              </button>
            )}
          </div>

          {app.notes ? (
            <div className="flex-1 bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 overflow-hidden min-w-0 w-full">
              <SmartNotesRenderer notes={app.notes} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-sm font-medium text-slate-500 min-h-[100px]">
              No notes recorded.
            </div>
          )}
        </motion.div>

        {/* LINKED COMMUNICATIONS */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="glass rounded-2xl p-6 flex flex-col border border-white/10 min-w-0 w-full overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-4 text-slate-500 text-xs font-bold uppercase tracking-[0.15em] shrink-0">
            <Mail size={14} />
            Linked Communications
          </div>

          {Array.isArray(app.linkedEmails) && app.linkedEmails.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {app.linkedEmails.map((email: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-200 truncate">
                    {email.subject ?? 'Email Thread'}
                  </p>
                  <p className="text-[10px] font-bold tracking-wider uppercase text-cyan-500/80 mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Detected by AI Sync
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-medium min-h-[100px]">
              No emails linked yet.
            </div>
          )}
        </motion.div>

      </div>
    </div>
  )
}