import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Calendar, CheckCircle2, X, Mail } from 'lucide-react'
import type { AISuggestion } from '../../types'
import { STAGE_LABEL, timeAgo } from '../../lib/utils'

// ── Single suggestion card ────────────────────────────────────

interface SuggestionCardProps {
  suggestion: AISuggestion
  onApprove:  () => void
  onReject:   () => void
  isApproving: boolean
  isRejecting: boolean
}

function SuggestionCard({
  suggestion,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: SuggestionCardProps) {
  const isLoading = isApproving || isRejecting

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, x: -20, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="glass rounded-xl border border-white/10 p-4"
    >
      <div className="flex items-start gap-3">
        {/* Mail icon */}
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Mail size={15} className="text-cyan-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Company name — most prominent */}
          <p className="text-sm font-semibold text-slate-200 truncate">
            {suggestion.companyName}
          </p>

          {/* Job title if available */}
          {suggestion.jobTitle && (
            <p className="text-xs text-slate-500 truncate mb-1">{suggestion.jobTitle}</p>
          )}

          {/* Email subject as context */}
          <p className="text-xs text-slate-400 truncate mb-2 italic">
            "{suggestion.emailSubject}"
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Suggested stage */}
            {suggestion.suggestedStage !== undefined && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25">
                → {STAGE_LABEL[suggestion.suggestedStage]}
              </span>
            )}

            {/* Suggested interview date */}
            {suggestion.suggestedInterviewDate && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.08]">
                <Calendar size={10} />
                {new Date(suggestion.suggestedInterviewDate).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
            )}

            <span className="text-[10px] text-slate-600 ml-auto">
              {timeAgo(suggestion.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onApprove}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={13} />
          {isApproving ? 'Approving…' : 'Approve'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReject}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          <X size={13} />
          {isRejecting ? 'Dismissing…' : 'Dismiss'}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────

function SuggestionSkeleton() {
  return (
    <div className="glass rounded-xl border border-white/[0.06] p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.05]" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-28 rounded bg-white/[0.06]" />
          <div className="h-3 w-44 rounded bg-white/[0.04]" />
          <div className="h-3 w-20 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  )
}

// ── Main widget ───────────────────────────────────────────────

interface Props {
  suggestions: AISuggestion[]
  isLoading:   boolean
  approvingId: number | null
  rejectingId: number | null
  onApprove:   (id: number) => void
  onReject:    (id: number) => void
}

export default function AiSuggestionsWidget({
  suggestions,
  isLoading,
  approvingId,
  rejectingId,
  onApprove,
  onReject,
}: Props) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={15} className="text-cyan-400" />
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          AI Suggestions
        </h2>
        {suggestions.length > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {suggestions.length} pending
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <SuggestionSkeleton key={i} />)}
        </div>
      ) : suggestions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-2xl border border-white/[0.07] p-8 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={20} className="text-cyan-400" />
          </div>
          <p className="text-slate-300 font-medium text-sm mb-1">No pending suggestions</p>
          <p className="text-slate-500 text-xs">
            Use "Sync Gmail" in the top bar to let AI detect new updates.
          </p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
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