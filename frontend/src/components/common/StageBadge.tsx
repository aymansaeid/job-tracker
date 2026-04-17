import { cn, STAGE_LABEL, stageColor } from '../../lib/utils'
import type { ApplicationStage } from '../../types'

interface Props {
  stage: ApplicationStage
  className?: string
}

export default function StageBadge({ stage, className }: Props) {
  return (
    <span className={cn(
      'text-[11px] font-bold px-2.5 py-1 rounded-full border',
      stageColor(stage),
      className,
    )}>
      {STAGE_LABEL[stage]}
    </span>
  )
}