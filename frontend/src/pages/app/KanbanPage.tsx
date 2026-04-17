import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { LayoutGrid } from 'lucide-react'
import { applicationsApi } from '../../lib/api'
import type { JobApplication, PaginatedResponse, ApplicationStage } from '../../types'
import KanbanBoard from '../../components/kanban/KanbanBoard'

export default function KanbanPage() {
  const queryClient = useQueryClient()

  // Fetch all apps (large page size — Kanban shows everything at once)
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

    // Optimistic update — move the card instantly, sync in background
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['applications-kanban'] })

      const previous = queryClient.getQueryData<PaginatedResponse<JobApplication>>(
        ['applications-kanban'],
      )

      if (previous) {
        queryClient.setQueryData<PaginatedResponse<JobApplication>>(
          ['applications-kanban'],
          {
            ...previous,
            items: previous.items.map(app =>
              app.id === id ? { ...app, currentStage: stage } : app,
            ),
          },
        )
      }

      return { previous }
    },

    // Roll back on error
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['applications-kanban'], context.previous)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['applications-kanban'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  // Extract the actual array from the paginated response
  const applications = data?.items ?? []

  // ── Skeleton ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-w-[260px] w-[260px] space-y-2.5 animate-pulse">
            <div className="h-7 w-24 rounded-full bg-white/[0.06] mb-3" />
            {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
              <div key={j} className="rounded-xl border border-white/[0.05] bg-white/[0.03] p-3.5 space-y-2">
                <div className="h-4 w-28 rounded bg-white/[0.06]" />
                <div className="h-3 w-20 rounded bg-white/[0.04]" />
                <div className="h-3 w-16 rounded bg-white/[0.03] mt-3" />
              </div>
            ))}
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
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
          <LayoutGrid size={28} className="text-cyan-400" />
        </div>
        <p className="text-slate-300 font-semibold mb-1">No applications yet</p>
        <p className="text-slate-500 text-sm">
          Add applications from the Applications page to see them here.
        </p>
      </motion.div>
    )
  }

  return (
    <KanbanBoard
      applications={applications}
      onStageChange={(id, stage) => stageMutation.mutate({ id, stage })}
    />
  )
}