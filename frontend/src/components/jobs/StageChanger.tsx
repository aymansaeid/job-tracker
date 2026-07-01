import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import type { ApplicationStage } from '../../types'
import { STAGE_ORDER, cn } from '../../lib/utils'
import { STAGE_META } from '../common/StageBadge'

interface Props {
  currentStage: ApplicationStage
  onChange:     (stage: ApplicationStage) => void
  isLoading:    boolean
}

export default function StageChanger({ currentStage, onChange, isLoading }: Props) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Move Stage
        </h3>
        {isLoading && <Loader2 size={13} className="animate-spin text-cyan-400" />}
      </div>

      <div className="flex flex-col gap-2">
        {STAGE_ORDER.map((stage) => {
          const isActive = stage === currentStage
          const meta = STAGE_META[stage]
          const Icon = meta.icon

          return (
            <motion.button
              key={stage}
              whileHover={isActive ? {} : { x: 4 }}
              whileTap={isActive ? {} : { scale: 0.98 }}
              onClick={() => !isActive && onChange(stage)}
              disabled={isActive || isLoading}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all',
                isActive
                  ? 'cursor-default'
                  : 'border-white/[0.07] text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 hover:border-white/[0.12] disabled:opacity-50',
              )}
              style={isActive ? { borderColor: `${meta.color}40`, background: `${meta.color}14`, color: meta.color } : undefined}
            >
              <Icon size={14} className="shrink-0" />
              <span className="text-xs font-semibold">{meta.label}</span>
              {isActive && (
                <span className="ml-auto text-[10px] font-bold opacity-70">Current</span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}