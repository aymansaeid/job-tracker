import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { applicationsApi } from '../../lib/api'
import type {
  JobApplication, PaginatedResponse,
  CreateApplicationRequest, UpdateApplicationRequest, EmploymentType
} from '../../types'
import ApplicationsFilter from '../../components/jobs/ApplicationsFilter'
import ApplicationsTable from '../../components/jobs/ApplicationsTable'
import ApplicationModal from '../../components/jobs/ApplicationModal'
import Pagination from '../../components/common/Pagination'
import type { ApplicationFormData } from '../../components/jobs/ApplicationModal'
import { Archive, ListTodo } from 'lucide-react'

const PAGE_SIZE = 10

export default function ApplicationsPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<number | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<JobApplication | null>(null)

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1) }, [search, stageFilter, showArchived])

  // ── Query ──────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery<PaginatedResponse<JobApplication>>({
    queryKey: ['applications', page, search, stageFilter, showArchived],
    queryFn: () => applicationsApi.getAll({
      PageNumber: page,
      PageSize: PAGE_SIZE,
      SearchTerm: search || undefined,
      Stage: stageFilter ?? undefined,
      IncludeArchived: showArchived,
    }).then(r => r.data),
    placeholderData: prev => prev,
  })

  // ── Mutations ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateApplicationRequest) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['applications-kanban'] })

      setModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateApplicationRequest }) =>
      applicationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['applications-kanban'] })

      setModalOpen(false)
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['applications-kanban'] })

    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['applications-kanban'] })

    },
  })

  const unarchiveMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.unarchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['applications-kanban'] })

    },
  })

  // ── Handlers ───────────────────────────────────────────────
  const handleSubmit = async (formData: ApplicationFormData) => {
    const appliedAt = new Date(formData.appliedAt).toISOString()
    const payload = {
      companyName: formData.companyName,
      jobTitle: formData.jobTitle,
      jobUrl: formData.jobUrl || undefined,
      location: formData.location || undefined,
      employmentType: Number(formData.employmentType) as EmploymentType,
      appliedAt,
      notes: formData.notes || undefined,
    }
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
  }

  const handleToggleArchiveRow = (id: number) => {
    const app = applications.find(a => a.id === id)
    if (app?.isArchived) {
      unarchiveMutation.mutate(id)
    } else {
      archiveMutation.mutate(id)
    }
  }

  // ── Data Prep ──────────────────────────────────────────────
  const rawItems = data?.items ?? []
  const applications = rawItems.filter(app => showArchived ? app.isArchived : true)
  const totalPages = data?.totalPages ?? 1

  const displayCount = showArchived ? applications.length : (data?.totalCount ?? 0)

  return (
    <>
      <div className="space-y-5">

        {/* ── Page header ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showArchived ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-cyan-500/10 border border-cyan-500/20'}`}>
              {showArchived ? <Archive size={17} className="text-amber-400" /> : <ListTodo size={17} className="text-cyan-400" />}
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-none transition-colors">
                {showArchived ? 'Archived Applications' : 'Active Applications'}
              </h1>
              {/* Live count — dynamically updates and labels itself */}
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {isLoading
                  ? 'Loading…'
                  : `${displayCount} ${showArchived ? 'archived' : 'total'} application${displayCount !== 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Filter bar ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <ApplicationsFilter
            search={search}
            onSearch={setSearch}
            stageFilter={stageFilter}
            onStageFilter={setStageFilter}
            showArchived={showArchived}
            onToggleArchived={() => setShowArchived(v => !v)}
            onAdd={() => { setEditing(null); setModalOpen(true) }}
          />
        </motion.div>

        {/* ── Archived mode banner ─────────────────────────── */}
        <AnimatePresence>
          {showArchived && (
            <motion.div
              key="archived-banner"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Archive size={14} className="text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300 font-medium">
                  Showing archived applications — hidden from your Kanban board.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table — subtle opacity fade when re-fetching ─── */}
        <motion.div
          animate={{ opacity: isFetching && !isLoading ? 0.6 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <ApplicationsTable
            applications={applications}
            isLoading={isLoading}
            onEdit={(app) => { setEditing(app); setModalOpen(true) }}
            onDelete={(id) => deleteMutation.mutate(id)}
            onArchive={handleToggleArchiveRow}
          />
        </motion.div>

        {/* ── Pagination ───────────────────────────────────── */}
        <AnimatePresence>
          {totalPages > 1 && !showArchived && (
            <motion.div
              key="pagination"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
            >
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Add / Edit modal ──────────────────────────────── */}
      <ApplicationModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initial={editing}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  )
}