import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Kanban } from 'lucide-react'
import { applicationsApi } from '../../lib/api'
import type { JobApplication, PaginatedResponse, ApplicationStage } from '../../types'
import { STAGE_ORDER } from '../../lib/utils'
import { STAGE_META } from '../../components/common/StageBadge'
import KanbanBoard from '../../components/kanban/KanbanBoard'

const EASE = [0.16, 1, 0.3, 1] as const

export default function KanbanPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<PaginatedResponse<JobApplication>>({
    queryKey: ['applications-kanban'],
    queryFn:  () => applicationsApi.getAll({
      PageSize:        100,
      IncludeArchived: false,
    }).then(r => r.data),
  })

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: ApplicationStage }) =>
      applicationsApi.changeStage(id, { stage }),

    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['applications-kanban'] })
      const previous = queryClient.getQueryData<PaginatedResponse<JobApplication>>(['applications-kanban'])
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<JobApplication>>(['applications-kanban'], {
          ...previous,
          items: previous.items.map(app =>
            app.id === id ? { ...app, currentStage: stage } : app,
          ),
        })
      }
      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['applications-kanban'], context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-kanban'] })
      queryClient.invalidateQueries({ queryKey: ['applications']        })
      queryClient.invalidateQueries({ queryKey: ['stats']               })
    },
  })

  const applications = data?.items ?? []

  const stageCounts = STAGE_ORDER.reduce<Record<number, number>>((acc, stage) => {
    acc[stage] = applications.filter(a => a.currentStage === stage && !a.isArchived).length
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[292px] shrink-0 animate-pulse">
            <div className="h-7 w-24 rounded-full bg-white/[0.06] mb-3" />
            <div className="rounded-2xl border border-white/[0.06] p-2.5 space-y-2 min-h-[300px]">
              {Array.from({ length: Math.max(1, 3 - i) }).map((_, j) => (
                <div key={j} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06]" />
                    <div className="h-3.5 w-24 rounded bg-white/[0.06]" />
                  </div>
                  <div className="h-3 w-32 rounded bg-white/[0.04]" />
                  <div className="h-px w-full bg-white/[0.04] my-1" />
                  <div className="h-3 w-16 rounded bg-white/[0.03]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        className="flex flex-col items-center justify-center py-32 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
          <Kanban size={28} className="text-cyan-400" />
        </div>
        <p className="text-slate-300 font-semibold font-display mb-1">Board is empty</p>
        <p className="text-slate-500 text-sm max-w-xs">
          Add applications from the Applications page and they'll appear here automatically.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, ease: EASE }}
        className="glass flex items-center gap-1 flex-wrap rounded-2xl px-4 py-3"
      >
        {STAGE_ORDER.map(stage => {
          const meta = STAGE_META[stage]
          return (
            <div key={stage} className="flex items-center gap-2 px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
              <span className="font-mono text-sm font-semibold" style={{ color: meta.color }}>
                {stageCounts[stage]}
              </span>
              <span className="text-xs text-slate-500">{meta.label}</span>
            </div>
          )
        })}
        <span className="ml-auto font-mono text-xs text-slate-600 pr-1">
          {applications.filter(a => !a.isArchived).length} total
        </span>
      </motion.div>

      <KanbanBoard
        applications={applications}
        onStageChange={(id, stage) => stageMutation.mutate({ id, stage })}
      />

    </div>
  )
}