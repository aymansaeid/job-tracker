import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ApplicationStage } from '../types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Stage number → display label
export const STAGE_LABEL: Record<ApplicationStage, string> = {
  [ApplicationStage.Applied]:   'Applied',
  [ApplicationStage.Screening]: 'Screening',
  [ApplicationStage.Interview]: 'Interview',
  [ApplicationStage.Offer]:     'Offer',
  [ApplicationStage.Rejected]:  'Rejected',
  [ApplicationStage.Withdrawn]: 'Withdrawn',
}

// Stage number → badge color classes
export function stageColor(stage: ApplicationStage): string {
  const map: Record<ApplicationStage, string> = {
    [ApplicationStage.Applied]:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
    [ApplicationStage.Screening]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    [ApplicationStage.Interview]: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    [ApplicationStage.Offer]:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    [ApplicationStage.Rejected]:  'bg-red-500/20 text-red-300 border-red-500/30',
    [ApplicationStage.Withdrawn]: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }
  return map[stage]
}

// Ordered stages for Kanban columns
export const STAGE_ORDER: ApplicationStage[] = [
  ApplicationStage.Applied,
  ApplicationStage.Screening,
  ApplicationStage.Interview,
  ApplicationStage.Offer,
  ApplicationStage.Rejected,
]

// "2 days ago" relative time
export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  const intervals = [
    { label: 'year',   secs: 31536000 },
    { label: 'month',  secs: 2592000  },
    { label: 'week',   secs: 604800   },
    { label: 'day',    secs: 86400    },
    { label: 'hour',   secs: 3600     },
    { label: 'minute', secs: 60       },
  ]
  for (const { label, secs } of intervals) {
    const count = Math.floor(seconds / secs)
    if (count >= 1) return `${count} ${label}${count !== 1 ? 's' : ''} ago`
  }
  return 'just now'
}