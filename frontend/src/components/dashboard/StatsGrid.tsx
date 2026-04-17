import { motion } from 'framer-motion'
import { Briefcase, TrendingUp, Calendar, XCircle } from 'lucide-react'
import type { DashboardStats } from '../../types'

interface StatCardProps {
  label: string
  value: number
  icon:  React.ElementType
  color: string
  bg:    string
  index: number
}

function StatCard({ label, value, icon: Icon, color, bg, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`glass glow-border rounded-2xl p-5 border ${bg} flex items-center gap-4`}
    >
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium mb-0.5">{label}</p>
        <motion.p
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          className={`font-display text-3xl font-bold ${color}`}
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  )
}

function StatSkeleton() {
  return (
    <div className="glass rounded-2xl border border-white/[0.06] p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-white/[0.05]" />
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-white/[0.05]" />
        <div className="h-8 w-12 rounded bg-white/[0.07]" />
      </div>
    </div>
  )
}

interface Props {
  stats:     DashboardStats | undefined
  isLoading: boolean
}

export default function StatsGrid({ stats, isLoading }: Props) {
  const cards = [
    {
      label: 'Total Applications',
      value: stats?.totalApplications ?? 0,
      icon:  Briefcase,
      color: 'text-cyan-400',
      bg:    'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Active Applications',
      value: stats?.activeApplications ?? 0,
      icon:  TrendingUp,
      color: 'text-violet-400',
      bg:    'bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Interviews Scheduled',
      value: stats?.interviewCount ?? 0,
      icon:  Calendar,
      color: 'text-emerald-400',
      bg:    'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Rejected',
      value: stats?.rejectedCount ?? 0,
      icon:  XCircle,
      color: 'text-red-400',
      bg:    'bg-red-500/10 border-red-500/20',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} index={i} />
      ))}
    </div>
  )
}