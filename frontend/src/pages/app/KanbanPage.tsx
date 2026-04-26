import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Kanban } from 'lucide-react'
import { applicationsApi } from '../../lib/api'
import type { JobApplication, PaginatedResponse, ApplicationStage } from '../../types'
import { STAGE_ORDER, STAGE_LABEL } from '../../lib/utils'
import KanbanBoard from '../../components/kanban/KanbanBoard'

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

    // Optimistic update
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

  // Count per stage for the header
  const stageCounts = STAGE_ORDER.reduce<Record<number, number>>((acc, stage) => {
    acc[stage] = applications.filter(a => a.currentStage === stage && !a.isArchived).length
    return acc
  }, {})

  // ── Skeleton ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-6 -mx-6 px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[280px] shrink-0 animate-pulse">
            <div className="h-7 w-24 rounded-full bg-white/[0.06] mb-3" />
            <div className="rounded-2xl border border-dashed border-white/[0.05] p-2 space-y-2 min-h-[300px]">
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

  // ── Empty state ───────────────────────────────────────────
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

  // ── Board ─────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Summary strip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0  }}
        className="flex items-center gap-3 flex-wrap"
      >
        {STAGE_ORDER.map(stage => (
          <div
            key={stage}
            className="flex items-center gap-1.5 text-xs text-slate-500"
          >
            <span className="font-bold text-slate-300">{stageCounts[stage]}</span>
            {STAGE_LABEL[stage]}
          </div>
        ))}
        <span className="ml-auto text-xs text-slate-600">
          {applications.filter(a => !a.isArchived).length} total
        </span>
      </motion.div>

      {/* Board */}
      <KanbanBoard
        applications={applications}
        onStageChange={(id, stage) => stageMutation.mutate({ id, stage })}
      />

    </div>
  )
}