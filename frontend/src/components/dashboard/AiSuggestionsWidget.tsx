import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Calendar, CheckCircle2, X,
  Mail, Loader2, ChevronRight, ExternalLink, Info
} from 'lucide-react'
import { useState } from 'react'
import type { AISuggestion } from '../../types'
import { STAGE_LABEL, timeAgo, cn } from '../../lib/utils'
import { ApplicationStage } from '../../types'

// ── Stage metadata for visual context ────────────────────────
const STAGE_META: Record<number, { emoji: string; color: string; bg: string; border: string; glow: string }> = {
  [ApplicationStage.Applied]:   { emoji: '📋', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    glow: 'bg-blue-500' },
  [ApplicationStage.InReview]:  { emoji: '🔍', color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/25',  glow: 'bg-yellow-500' },
  [ApplicationStage.Interview]: { emoji: '🎯', color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/25',  glow: 'bg-violet-500' },
  [ApplicationStage.Offer]:     { emoji: '🎉', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', glow: 'bg-emerald-500' },
  [ApplicationStage.Rejected]:  { emoji: '❌', color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     glow: 'bg-red-500' },
  [ApplicationStage.Ghosted]:   { emoji: '👻', color: 'text-slate-400',   bg: 'bg-slate-500/10',   border: 'border-slate-500/25',   glow: 'bg-slate-500' },
}

// ── Single suggestion card ────────────────────────────────────
interface CardProps {
  suggestion:  AISuggestion
  onApprove:   () => void
  onReject:    () => void
  isApproving: boolean
  isRejecting: boolean
}

function SuggestionCard({ suggestion, onApprove, onReject, isApproving, isRejecting }: CardProps) {
  const [expanded, setExpanded] = useState(false)

  const isLoading = isApproving || isRejecting
  const stage     = suggestion.suggestedStage
  const meta      = stage !== undefined ? STAGE_META[stage] : null

  const interviewDate = suggestion.suggestedInterviewDate
    ? new Date(suggestion.suggestedInterviewDate).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      })
    : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, x: -24, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="glass rounded-2xl border border-white/10 overflow-hidden group flex flex-col relative"
    >
      {/* ── Ambient Neon Glow ──────────────────────────── */}
      {meta && (
        <div className={cn('absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-20 pointer-events-none rounded-full', meta.glow)} />
      )}

      <div className="p-5 flex-1 flex flex-col relative z-10">

        {/* ── Header: company + emoji + time ───────────── */}
        <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 text-lg shadow-sm',
              meta ? cn(meta.bg, meta.border) : 'bg-white/[0.05] border-white/10',
            )}>
              {meta?.emoji ?? '📧'}
            </div>

            <div>
              <p className="text-sm font-bold text-white leading-tight tracking-wide">
                {suggestion.companyName}
              </p>
              {suggestion.jobTitle && (
                <p className="text-xs text-slate-400 mt-0.5">{suggestion.jobTitle}</p>
              )}
            </div>
          </div>

          <span className="text-[10px] text-slate-500 whitespace-nowrap mt-1 font-medium">
            {timeAgo(suggestion.createdAt)}
          </span>
        </div>

        {/* ── Premium AI Insight Box ────────────────────── */}
        <div className="mb-4 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <Sparkles size={14} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 leading-snug font-medium">
                {suggestion.aiReasoning ?? "New update detected from this email."}
              </p>
              
              {/* Action Link */}
              {suggestion.actionUrl && (
                <a 
                  href={suggestion.actionUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink size={12} />
                  Open Meeting / Link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Metadata chips ────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap mb-5 shrink-0">
          {stage !== undefined && meta && (
            <span className={cn(
              'flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border',
              meta.bg, meta.color, meta.border,
            )}>
              <ChevronRight size={12} />
              Move to {STAGE_LABEL[stage]}
            </span>
          )}

          {interviewDate && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded-lg">
              <Calendar size={12} className="text-slate-400" />
              {interviewDate}
            </span>
          )}
        </div>

        {/* ── Sleek Email Subject Toggle ────────────────── */}
        <div className="mt-auto pt-3 border-t border-white/[0.04]">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors w-full group"
          >
            <Mail size={12} className="shrink-0 group-hover:text-cyan-400 transition-colors" />
            <span className="flex-1 text-left truncate font-medium">"{suggestion.emailSubject}"</span>
            <ChevronRight size={12} className={cn('transition-transform shrink-0', expanded && 'rotate-90')} />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{    opacity: 0, height: 0     }}
                className="overflow-hidden"
              >
                <div className="pt-2 pb-1">
                  <p className="text-[11px] text-slate-400 font-mono leading-relaxed break-words bg-black/20 p-2.5 rounded-lg border border-white/[0.02]">
                    {suggestion.emailSubject}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Action buttons ────────────────────────────── */}
        <div className="grid grid-cols-[1fr_auto] gap-2 mt-4 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onApprove}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all disabled:opacity-50"
          >
            {isApproving
              ? <><Loader2 size={14} className="animate-spin" /> Approving…</>
              : <><CheckCircle2 size={14} /> Approve & Update</>
            }
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReject}
            disabled={isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all disabled:opacity-50 shrink-0"
            title="Dismiss"
          >
            {isRejecting ? <Loader2 size={14} className="animate-spin" /> : <X size={16} />}
          </motion.button>
        </div>

      </div>
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function SuggestionSkeleton() {
  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden animate-pulse p-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-3.5 w-24 rounded-md bg-white/[0.06]" />
          <div className="h-2.5 w-16 rounded-md bg-white/[0.04]" />
        </div>
      </div>
      <div className="h-16 rounded-xl bg-white/[0.03] border border-white/[0.02]" />
      <div className="flex gap-2">
        <div className="h-7 w-24 rounded-lg bg-white/[0.05]" />
        <div className="h-7 w-28 rounded-lg bg-white/[0.04]" />
      </div>
      <div className="h-10 rounded-xl bg-white/[0.04] mt-4" />
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
  suggestions, isLoading, approvingId, rejectingId, onApprove, onReject,
}: Props) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5 relative">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles size={12} className="text-white" />
        </div>
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
          AI Suggestions
        </h2>
        
        {/* Premium Hover Tooltip */}
        <div className="group relative flex items-center ml-0.5">
          <Info size={14} className="text-slate-600 hover:text-cyan-400 transition-colors cursor-help" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 rounded-lg bg-[#0f172a] border border-white/10 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <p className="text-xs text-slate-300 leading-relaxed text-center font-medium">
              We securely scan your connected Gmail for interview invites and offers, then use AI to extract the links and update your Kanban board.
            </p>
            {/* Tooltip triangle pointer */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#0f172a]" />
          </div>
        </div>
        
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1    }}
              exit={{    opacity: 0, scale: 0.8  }}
              className="ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
            >
              {suggestions.length} pending
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <SuggestionSkeleton key={i} />)}
        </div>
      ) : suggestions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-2xl border border-white/[0.04] p-10 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Sparkles size={20} className="text-cyan-400" />
          </div>
          <p className="text-slate-200 font-bold text-sm mb-1.5">
            Inbox Zero
          </p>
          <p className="text-slate-500 text-xs">
            Hit "Sync Gmail" to let the AI scan for new updates.
          </p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
          <AnimatePresence mode="popLayout">
            {suggestions.map(s => (
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