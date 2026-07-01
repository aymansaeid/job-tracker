import type { LucideIcon } from 'lucide-react'
import { Send, Search, Users, Trophy, XCircle, Ghost } from 'lucide-react'
import { ApplicationStage } from '../../types'
import { cn } from '../../lib/utils'

export const STAGE_META: Record<ApplicationStage, { label: string; color: string; icon: LucideIcon }> = {
  [ApplicationStage.Applied]:   { label: 'Applied',   color: '#3B82F6', icon: Send },
  [ApplicationStage.InReview]:  { label: 'In Review', color: '#FACC15', icon: Search },
  [ApplicationStage.Interview]: { label: 'Interview', color: '#8B5CF6', icon: Users },
  [ApplicationStage.Offer]:     { label: 'Offer',      color: '#10B981', icon: Trophy },
  [ApplicationStage.Rejected]:  { label: 'Rejected',   color: '#EF4444', icon: XCircle },
  [ApplicationStage.Ghosted]:   { label: 'Ghosted',    color: '#64748B', icon: Ghost },
}

interface StageBadgeProps {
  stage: ApplicationStage
  className?: string
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const meta = STAGE_META[stage]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap',
        className,
      )}
      style={{ borderColor: `${meta.color}33`, background: `${meta.color}14`, color: meta.color }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  )
}

export function StageIconChip({ stage, size = 36 }: { stage: ApplicationStage; size?: number }) {
  const meta = STAGE_META[stage]
  const Icon = meta.icon
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl border"
      style={{ width: size, height: size, background: `${meta.color}1A`, borderColor: `${meta.color}33` }}
    >
      <Icon size={size * 0.45} style={{ color: meta.color }} />
    </div>
  )
}