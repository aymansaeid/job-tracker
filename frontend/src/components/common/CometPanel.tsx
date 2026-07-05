import type { ReactNode, CSSProperties } from 'react'
import { cn } from '../../lib/utils'

interface CometPanelProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  /** Seconds for one full rotation. 10–12 is the sweet spot — much faster
   *  and it stops feeling "slow motion premium," much slower and it feels broken. */
  duration?: number
}

/**
 * Glass card with a slow-rotating comet sweeping a 1px conic-gradient border.
 * Reserve this for 1-2 hero surfaces per screen — overuse kills the effect.
 */
export function CometPanel({ children, className, contentClassName, duration = 11 }: CometPanelProps) {
  return (
    <div
      className={cn('comet-border relative rounded-2xl p-[1px] overflow-hidden', className)}
      style={{ '--comet-duration': `${duration}s` } as CSSProperties}
    >
      <div className={cn('relative z-10 min-w-0 rounded-[inherit] bg-slate-950/80 backdrop-blur-2xl', contentClassName)}>
        {children}
      </div>
    </div>
  )
}