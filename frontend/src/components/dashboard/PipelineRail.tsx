import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { DashboardStats } from '../../types'
import { ApplicationStage } from '../../types'
import { STAGE_ORDER } from '../../lib/utils'
import { STAGE_META } from '../common/StageBadge'

const EASE = [0.16, 1, 0.3, 1] as const

function getStageCount(stats: DashboardStats | undefined, stage: ApplicationStage): number {
  if (!stats) return 0
  switch (stage) {
    case ApplicationStage.Applied:   return stats.appliedCount
    case ApplicationStage.InReview:  return stats.inReviewCount
    case ApplicationStage.Interview: return stats.interviewCount
    case ApplicationStage.Offer:     return stats.offerCount
    case ApplicationStage.Rejected:  return stats.rejectedCount
    case ApplicationStage.Ghosted:   return stats.ghostedCount
    default: return 0
  }
}

interface Props {
  stats: DashboardStats | undefined
  isLoading: boolean
}

export default function PipelineRail({ stats, isLoading }: Props) {
  const gradient = useMemo(
    () => `linear-gradient(to right, ${STAGE_ORDER.map((s) => STAGE_META[s].color).join(',')})`,
    []
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
      className="glass relative overflow-hidden rounded-2xl p-6"
    >
      <p className="mb-7 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
        Pipeline
      </p>

      <div className="overflow-x-auto pb-1">
        <div className="relative flex min-w-[560px] items-center justify-between px-1">
          <div
            className="absolute left-1 right-1 top-[17px] h-px opacity-30"
            style={{ background: gradient }}
          />
          {STAGE_ORDER.map((stage, i) => {
            const meta = STAGE_META[stage]
            const count = getStageCount(stats, stage)
            const Icon = meta.icon
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.35, ease: EASE }}
                className="relative z-10 flex flex-col items-center gap-2.5"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 bg-surface-elevated font-mono text-[12px] font-semibold"
                  style={{
                    borderColor: meta.color,
                    color: meta.color,
                    boxShadow: isLoading ? 'none' : `0 0 14px ${meta.color}55`,
                  }}
                >
                  {isLoading ? <Icon size={13} className="opacity-50" /> : count}
                </span>
                <span className="whitespace-nowrap text-[11px] font-medium text-slate-400">
                  {meta.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}