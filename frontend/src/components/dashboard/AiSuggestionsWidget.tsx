import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Calendar, CheckCircle2, X,
  Mail, Loader2, ChevronRight, ExternalLink, Info
} from 'lucide-react'
import { useState } from 'react'
import type { AISuggestion } from '../../types'
import { timeAgo, cn } from '../../lib/utils'
import { STAGE_META, StageIconChip } from '../common/StageBadge'

interface CardProps {
  suggestion: AISuggestion
  onApprove: () => void
  onReject: () => void
  isApproving: boolean
  isRejecting: boolean
}

function SuggestionCard({ suggestion, onApprove, onReject, isApproving, isRejecting }: CardProps) {
  const [expanded, setExpanded] = useState(false)

  const isLoading = isApproving || isRejecting
  const stage = suggestion.suggestedStage
  const meta = stage !== undefined ? STAGE_META[stage] : null

  const interviewDate = suggestion.suggestedInterviewDate
    ? new Date(suggestion.suggestedInterviewDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      })
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="glass relative flex flex-col overflow-hidden rounded-2xl"
    >
      {meta && (
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full opacity-20 blur-[80px]"
          style={{ background: meta.color }}
        />
      )}

      <div className="relative z-10 flex flex-1 flex-col p-5">

        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {meta ? (
              <StageIconChip stage={stage!} size={40} />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                <Mail size={17} className="text-slate-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold leading-tight tracking-wide text-white">
                {suggestion.companyName}
              </p>
              {suggestion.jobTitle && (
                <p className="mt-0.5 text-xs text-slate-400">{suggestion.jobTitle}</p>
              )}
            </div>
          </div>
          <span className="mt-1 whitespace-nowrap text-[10px] font-medium text-slate-500">
            {timeAgo(suggestion.createdAt)}
          </span>
        </div>

        <div className="mb-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5 shadow-inner">
          <div className="flex items-start gap-3">
            <Sparkles size={14} className="mt-0.5 shrink-0 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-slate-200">
                {suggestion.aiReasoning ?? 'New update detected from this email.'}
              </p>
              {/* 👇 FIX: Added the missing `<a` tag here */}
              {suggestion.actionUrl && (
                <a
                  href={suggestion.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  <ExternalLink size={12} />
                  Open Meeting / Link
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mb-5 flex shrink-0 flex-wrap items-center gap-2">
          {stage !== undefined && meta && (
            <span
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold"
              style={{ borderColor: `${meta.color}33`, background: `${meta.color}14`, color: meta.color }}
            >
              <ChevronRight size={12} />
              Move to {meta.label}
            </span>
          )}
          {interviewDate && (
            <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-slate-300">
              <Calendar size={12} className="text-slate-400" />
              {interviewDate}
            </span>
          )}
        </div>

        <div className="mt-auto border-t border-white/[0.04] pt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="group flex w-full items-center gap-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            <Mail size={12} className="shrink-0 transition-colors group-hover:text-cyan-400" />
            <span className="flex-1 truncate text-left font-medium">"{suggestion.emailSubject}"</span>
            <ChevronRight size={12} className={cn('shrink-0 transition-transform', expanded && 'rotate-90')} />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-1 pt-2">
                  <p className="break-words rounded-lg border border-white/[0.02] bg-black/20 p-2.5 font-mono text-[11px] leading-relaxed text-slate-400">
                    {suggestion.emailSubject}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 grid shrink-0 grid-cols-[1fr_auto] gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onApprove}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-400 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            {isApproving ? (
              <><Loader2 size={14} className="animate-spin" /> Approving…</>
            ) : (
              <><CheckCircle2 size={14} /> Approve & Update</>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReject}
            disabled={isLoading}
            title="Dismiss"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 transition-all hover:bg-rose-500/20 disabled:opacity-50"
          >
            {isRejecting ? <Loader2 size={14} className="animate-spin" /> : <X size={16} />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function SuggestionSkeleton() {
  return (
    <div className="glass animate-pulse space-y-5 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-3.5 w-24 rounded-md bg-white/[0.06]" />
          <div className="h-2.5 w-16 rounded-md bg-white/[0.04]" />
        </div>
      </div>
      <div className="h-16 rounded-xl border border-white/[0.02] bg-white/[0.03]" />
      <div className="flex gap-2">
        <div className="h-7 w-24 rounded-lg bg-white/[0.05]" />
        <div className="h-7 w-28 rounded-lg bg-white/[0.04]" />
      </div>
      <div className="mt-4 h-10 rounded-xl bg-white/[0.04]" />
    </div>
  )
}

interface Props {
  suggestions: AISuggestion[]
  isLoading: boolean
  approvingId: number | null
  rejectingId: number | null
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export default function AiSuggestionsWidget({
  suggestions, isLoading, approvingId, rejectingId, onApprove, onReject,
}: Props) {
  return (
    <div>
      <div className="relative mb-5 flex items-center gap-2.5">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20">
          <Sparkles size={12} className="text-white" />
        </div>
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          AI Suggestions
        </h2>

        <div className="group relative ml-0.5 flex items-center">
          <Info size={14} className="cursor-help text-slate-600 transition-colors hover:text-cyan-400" />
          <div className="glass-raised pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg p-3 opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
            <p className="text-center text-xs font-medium leading-relaxed text-slate-300">
              We securely scan your connected Gmail for interview invites and offers, then use AI to extract the links and update your Kanban board.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="ml-auto rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400"
            >
              {suggestions.length} pending
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SuggestionSkeleton key={i} />)}
        </div>
      ) : suggestions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass relative overflow-hidden rounded-2xl p-10 text-center"
        >
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)' }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
          />
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 shadow-inner">
            <Sparkles size={20} className="text-cyan-400" />
          </div>
          <p className="mb-1.5 text-sm font-bold text-slate-200">Inbox Zero</p>
          <p className="text-xs text-slate-500">Hit "Sync Gmail" to let the AI scan for new updates.</p>
        </motion.div>
      ) : (
        <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onApprove={() => onApprove(s.id)}
                onReject={() => onReject(s.id)}
                isApproving={approvingId === s.id}
                isRejecting={rejectingId === s.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}