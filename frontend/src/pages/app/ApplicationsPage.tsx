import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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
import { Archive } from 'lucide-react'

const PAGE_SIZE = 10

export default function ApplicationsPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<number | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<JobApplication | null>(null)

  // ── Query ──────────────────────────────────────────────────
  const { data, isLoading } = useQuery<PaginatedResponse<JobApplication>>({
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
      setModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateApplicationRequest }) =>
      applicationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setModalOpen(false)
      setEditing(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.archive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications'] }),
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

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleStageFilter = (v: number | null) => { setStageFilter(v); setPage(1) }
  const handleToggleArchived = () => { setShowArchived(v => !v); setPage(1) }

  const applications = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <>
      <div className="space-y-5">

        {/* Filter bar */}
        <ApplicationsFilter
          search={search}
          onSearch={handleSearch}
          stageFilter={stageFilter}
          onStageFilter={handleStageFilter}
          showArchived={showArchived}
          onToggleArchived={handleToggleArchived}
          onAdd={() => { setEditing(null); setModalOpen(true) }}
        />

        {/* Archived banner */}
        {showArchived && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Archive size={14} className="text-amber-400" />
            <p className="text-xs text-amber-300 font-medium">
              Showing archived applications. These are hidden from your Kanban board.
            </p>
          </div>
        )}

        {/* Table */}
        <ApplicationsTable
          applications={applications}
          isLoading={isLoading}
          onEdit={(app) => { setEditing(app); setModalOpen(true) }}
          onDelete={(id) => deleteMutation.mutate(id)}
          onArchive={(id) => archiveMutation.mutate(id)}
        />

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

      </div>

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