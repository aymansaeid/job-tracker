import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { applicationsApi, suggestionsApi } from '../../lib/api'
import type { DashboardStats, AISuggestion, JobApplication, PaginatedResponse } from '../../types'
import { SuggestionStatus } from '../../types'
import StatsGrid               from '../../components/dashboard/StatsGrid'
import AiSuggestionsWidget     from '../../components/dashboard/AiSuggestionsWidget'
import RecentApplicationsTable from '../../components/dashboard/RecentApplicationsTable'

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)

  // ── Queries ──────────────────────────────────────────────────

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

  // Applications returns a paginated object — we extract .items
  const { data: applicationsPage, isLoading: applicationsLoading } =
    useQuery<PaginatedResponse<JobApplication>>({
      queryKey: ['applications'],
      queryFn:  () => applicationsApi.getAll({ PageSize: 20 }).then(r => r.data),
    })

  // ── Mutations ─────────────────────────────────────────────────

  const approveMutation = useMutation({
    mutationFn: (id: number) => suggestionsApi.approve(id),
    onMutate:   (id) => setApprovingId(id),
    onSettled:  () => {
      setApprovingId(null)
      queryClient.invalidateQueries({ queryKey: ['suggestions']   })
      queryClient.invalidateQueries({ queryKey: ['stats']         })
      queryClient.invalidateQueries({ queryKey: ['applications']  })
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

  // Only pending suggestions in the widget
  const pendingSuggestions = suggestions.filter(
    s => s.status === SuggestionStatus.Pending
  )

  // Safe — always an array even before data loads
  const applicationItems = applicationsPage?.items ?? []

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-10">

      <section>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-4">
          Overview
        </p>
        <StatsGrid stats={stats} isLoading={statsLoading} />
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