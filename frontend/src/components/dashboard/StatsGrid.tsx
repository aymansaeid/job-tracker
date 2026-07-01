import { motion } from 'framer-motion'
import { Briefcase, TrendingUp, Calendar } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DashboardStats } from '../../types'
import { ApplicationStage } from '../../types'
import { STAGE_META } from '../common/StageBadge'

const EASE = [0.16, 1, 0.3, 1] as const

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  tint: string
  live?: boolean
  index: number
}

function StatCard({ label, value, icon: Icon, tint, live, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: EASE }}
      whileHover={{ y: -3 }}
      className="glass relative overflow-hidden rounded-2xl p-5"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.16] blur-2xl"
        style={{ background: tint }}
      />
      <div className="relative flex items-center justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border"
          style={{ background: `${tint}1A`, borderColor: `${tint}33` }}
        >
          <Icon size={20} style={{ color: tint }} />
        </div>
        {live && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: tint }} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: tint }} />
          </span>
        )}
      </div>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-4 font-mono text-[28px] font-medium leading-none text-white"
      >
        {value}
      </motion.p>
      <p className="relative mt-2 text-[12px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </motion.div>
  )
}

function StatSkeleton() {
  return (
    <div className="glass animate-pulse space-y-4 rounded-2xl p-5">
      <div className="h-11 w-11 rounded-xl bg-white/[0.05]" />
      <div className="space-y-2">
        <div className="h-7 w-14 rounded bg-white/[0.07]" />
        <div className="h-3 w-24 rounded bg-white/[0.05]" />
      </div>
    </div>
  )
}

interface Props {
  stats: DashboardStats | undefined
  isLoading: boolean
}

export default function StatsGrid({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
    )
  }

  const interviewMeta = STAGE_META[ApplicationStage.Interview]
  const rejectedMeta = STAGE_META[ApplicationStage.Rejected]

  const cards: Omit<StatCardProps, 'index'>[] = [
    { label: 'Total Applications',    value: stats?.totalApplications ?? 0,  icon: Briefcase,        tint: '#22D3EE' },
    { label: 'Active Applications',   value: stats?.activeApplications ?? 0, icon: TrendingUp,        tint: '#8B5CF6', live: true },
    { label: 'Interviews Scheduled',  value: stats?.interviewCount ?? 0,     icon: Calendar,          tint: interviewMeta.color },
    { label: 'Rejected',              value: stats?.rejectedCount ?? 0,      icon: rejectedMeta.icon, tint: rejectedMeta.color },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} index={i} />
      ))}
    </div>
  )
}