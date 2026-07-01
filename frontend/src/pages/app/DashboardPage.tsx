import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { applicationsApi, suggestionsApi } from '../../lib/api'
import type { DashboardStats, AISuggestion, JobApplication, PaginatedResponse } from '../../types'
import { SuggestionStatus } from '../../types'
import StatsGrid               from '../../components/dashboard/StatsGrid'
import PipelineRail            from '../../components/dashboard/PipelineRail'
import AiSuggestionsWidget     from '../../components/dashboard/AiSuggestionsWidget'
import RecentApplicationsTable from '../../components/dashboard/RecentApplicationsTable'

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  const { data: stats, isLoading: statsLoading } =
    useQuery<DashboardStats>({
      queryKey: ['stats'],
      queryFn:  () => applicationsApi.getStats().then(r => r.data),
    })

  const { data: suggestions = [], isLoading: suggestionsLoading } =
    useQuery<AISuggestion[]>({
      queryKey: ['suggestions'],
      queryFn:  () => suggestionsApi.getPending().then(r => r.data),
    })

  const { data: applicationsPage, isLoading: applicationsLoading } =
    useQuery<PaginatedResponse<JobApplication>>({
      queryKey: ['applications'],
      queryFn:  () => applicationsApi.getAll({ PageSize: 20 }).then(r => r.data),
    })

  const approveMutation = useMutation({
    mutationFn: (id: number) => suggestionsApi.approve(id),
    onMutate:   (id) => setApprovingId(id),
    onSettled:  () => {
      setApprovingId(null)
      queryClient.invalidateQueries({ queryKey: ['suggestions']  })
      queryClient.invalidateQueries({ queryKey: ['stats']        })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => suggestionsApi.reject(id),
    onMutate:   (id) => setRejectingId(id),
    onSettled:  () => {
      setRejectingId(null)
      queryClient.invalidateQueries({ queryKey: ['suggestions'] })
    },
  })

  const pendingSuggestions = suggestions.filter(s => s.status === SuggestionStatus.Pending)
  const applicationItems = applicationsPage?.items ?? []

  return (
    <div className="space-y-10">

      <section>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
          Overview
        </p>
        <StatsGrid stats={stats} isLoading={statsLoading} />
        <div className="mt-4">
          <PipelineRail stats={stats} isLoading={statsLoading} />
        </div>
      </section>

      <section id="tour-ai-widget">
        <AiSuggestionsWidget
          suggestions={pendingSuggestions}
          isLoading={suggestionsLoading}
          approvingId={approvingId}
          rejectingId={rejectingId}
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={(id)  => rejectMutation.mutate(id)}
        />
      </section>

      <section>
        <RecentApplicationsTable
          applications={applicationItems}
          isLoading={applicationsLoading}
        />
      </section>

    </div>
  )
}