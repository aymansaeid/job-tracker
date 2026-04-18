import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import type { HistoryEvent } from '../../types'
import { STAGE_LABEL, stageColor, cn } from '../../lib/utils'

interface Props {
  events:    HistoryEvent[]
  isLoading: boolean
}

function SkeletonEvent() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
        <div className="w-px flex-1 bg-white/[0.04] mt-1" />
      </div>
      <div className="pb-8 space-y-2 flex-1">
        <div className="h-4 w-24 rounded bg-white/[0.06]" />
        <div className="h-3 w-40 rounded bg-white/[0.04]" />
        <div className="h-3 w-32 rounded bg-white/[0.03]" />
      </div>
    </div>
  )
}

export default function HistoryTimeline({ events, isLoading }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Clock size={14} className="text-slate-400" />
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          History
        </h3>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonEvent key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="glass rounded-2xl border border-white/[0.07] p-8 text-center">
          <Clock size={20} className="text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No history yet.</p>
        </div>
      ) : (
        <div>
          {events.map((event, i) => {
            const isLast  = i === events.length - 1
            const colors  = stageColor(event.stage)

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0   }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="flex gap-4"
              >
                {/* Left — dot + line */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10',
                    colors,
                  )}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-white/[0.06] my-1" />
                  )}
                </div>

                {/* Right — content */}
                <div className={cn('flex-1', !isLast ? 'pb-7' : 'pb-2')}>
                  {/* Stage badge */}
                  <span className={cn(
                    'text-[11px] font-bold px-2.5 py-1 rounded-full border inline-block mb-1.5',
                    colors,
                  )}>
                    {STAGE_LABEL[event.stage]}
                  </span>

                  {/* Comment */}
                  {event.comment && (
                    <p className="text-sm text-slate-300 mb-1.5 leading-relaxed">
                      {event.comment}
                    </p>
                  )}

                  {/* Timestamp */}
                  <p className="text-[11px] text-slate-600">
                    {new Date(event.changedAt).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short',
                      day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}