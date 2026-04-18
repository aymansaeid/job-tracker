import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { applicationsApi } from '../../lib/api'
import type {
  JobApplication, HistoryEvent, ApplicationStage,
} from '../../types'
import ApplicationDetail  from '../../components/jobs/ApplicationDetail'
import HistoryTimeline    from '../../components/jobs/HistoryTimeline'
import StageChanger       from '../../components/jobs/StageChanger'
import ApplicationModal   from '../../components/jobs/ApplicationModal'
import type { ApplicationFormData } from '../../components/jobs/ApplicationModal'

export default function ApplicationDetailPage() {
  const { id }       = useParams<{ id: string }>()
  const appId        = Number(id)
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  // ── Queries ───────────────────────────────────────────────

  const { data: app, isLoading: appLoading } = useQuery<JobApplication>({
    queryKey: ['application', appId],
    queryFn:  () => applicationsApi.getById(appId).then(r => r.data),
    enabled:  !!appId,
  })

  const { data: history = [], isLoading: historyLoading } = useQuery<HistoryEvent[]>({
    queryKey: ['application-history', appId],
    queryFn:  () => applicationsApi.getHistory(appId).then(r => r.data),
    enabled:  !!appId,
  })

  // ── Mutations ─────────────────────────────────────────────

  const stageMutation = useMutation({
    mutationFn: (stage: ApplicationStage) =>
      applicationsApi.changeStage(appId, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId]         })
      queryClient.invalidateQueries({ queryKey: ['application-history', appId] })
      queryClient.invalidateQueries({ queryKey: ['applications']               })
      queryClient.invalidateQueries({ queryKey: ['applications-kanban']        })
      queryClient.invalidateQueries({ queryKey: ['stats']                      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: unknown) => applicationsApi.update(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] })
      queryClient.invalidateQueries({ queryKey: ['applications']       })
      setEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => applicationsApi.delete(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats']        })
      navigate('/app/applications', { replace: true })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => applicationsApi.archive(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] })
      queryClient.invalidateQueries({ queryKey: ['applications']       })
    },
  })

  // ── Handlers ──────────────────────────────────────────────

  const handleUpdate = async (formData: ApplicationFormData) => {
    await updateMutation.mutateAsync({
      companyName:    formData.companyName,
      jobTitle:       formData.jobTitle,
      jobUrl:         formData.jobUrl  || undefined,
      location:       formData.location || undefined,
      employmentType: Number(formData.employmentType),
      appliedAt:      new Date(formData.appliedAt).toISOString(),
      notes:          formData.notes   || undefined,
    })
  }

  // ── Loading skeleton ──────────────────────────────────────

  if (appLoading) {
    return (
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 animate-pulse">
        <div className="space-y-5">
          <div className="glass rounded-2xl border border-white/[0.06] h-40" />
          <div className="glass rounded-2xl border border-white/[0.06] h-52" />
        </div>
        <div className="space-y-5">
          <div className="glass rounded-2xl border border-white/[0.06] h-72" />
          <div className="glass rounded-2xl border border-white/[0.06] h-64" />
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-24">
        <p className="text-slate-400 text-lg mb-4">Application not found.</p>
        <button onClick={() => navigate('/app/applications')} className="btn-ghost px-6 py-2.5">
          ← Back to Applications
        </button>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0  }}
        onClick={() => navigate('/app/applications')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-6 group"
      >
        <ArrowLeft
          size={15}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Back to Applications
      </motion.button>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">

        {/* Left — details + timeline */}
        <div className="space-y-6">
          <ApplicationDetail
            app={app}
            onEdit={() => setEditOpen(true)}
            onDelete={() => deleteMutation.mutate()}
            onArchive={() => archiveMutation.mutate()}
          />

          <div className="glass rounded-2xl border border-white/10 p-6">
            <HistoryTimeline
              events={history}
              isLoading={historyLoading}
            />
          </div>
        </div>

        {/* Right — stage changer */}
        <div className="space-y-5">
          <StageChanger
            currentStage={app.currentStage}
            onChange={(stage) => stageMutation.mutate(stage)}
            isLoading={stageMutation.isPending}
          />
        </div>

      </div>

      {/* Edit modal */}
      <ApplicationModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        initial={app}
        isLoading={updateMutation.isPending}
      />
    </>
  )
}