import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ApplicationStage } from '../types'
import { EmploymentType } from '../types'
import { AxiosError } from 'axios' 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Ordered stages for Kanban columns, the Pipeline Rail, and the stage filter.
// Stage → label/color/icon lives in one place: components/common/StageBadge.tsx
export const STAGE_ORDER: ApplicationStage[] = [
  ApplicationStage.Applied,
  ApplicationStage.InReview,
  ApplicationStage.Interview,
  ApplicationStage.Offer,
  ApplicationStage.Rejected,
  ApplicationStage.Ghosted,
]

// Stage number → badge color classes
export function stageColor(stage: ApplicationStage): string {
  const map: Record<ApplicationStage, string> = {
    [ApplicationStage.Applied]:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
    [ApplicationStage.InReview]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    [ApplicationStage.Interview]: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    [ApplicationStage.Offer]:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    [ApplicationStage.Rejected]:  'bg-red-500/20 text-red-300 border-red-500/30',
    [ApplicationStage.Ghosted]: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  }
  return map[stage]
}

// Stage number → display label
export const STAGE_LABEL: Record<ApplicationStage, string> = {
  [ApplicationStage.Applied]:   'Applied',
  [ApplicationStage.InReview]: 'In Review',
  [ApplicationStage.Interview]: 'Interview',
  [ApplicationStage.Offer]:     'Offer',
  [ApplicationStage.Rejected]:  'Rejected',
  [ApplicationStage.Ghosted]: 'Ghosted',
}

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]:   'Full-time',
  [EmploymentType.PartTime]:   'Part-time',
  [EmploymentType.Contract]:   'Contract',
  [EmploymentType.Internship]: 'Internship',
}

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

export function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function extractApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    // 1. Catch .NET FluentValidation errors (e.g., "Password must contain a number")
    if (error.response?.data?.extensions?.errors) {
      const errorsObj = error.response.data.extensions.errors;
      const firstKey = Object.keys(errorsObj)[0];
      return errorsObj[firstKey][0]; 
    }

    // 2. Catch standard .NET ProblemDetails (e.g., "Email already exists")
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }

    // 3. Fallback for custom message properties
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}