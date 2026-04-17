import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { applicationsApi } from '../../lib/api'
import type {
  JobApplication, PaginatedResponse,
  CreateApplicationRequest, UpdateApplicationRequest,
} from '../../types'
import { EmploymentType } from '../../types'
import ApplicationsFilter  from '../../components/jobs/ApplicationsFilter'
import ApplicationsTable   from '../../components/jobs/ApplicationsTable'
import ApplicationModal    from '../../components/jobs/ApplicationModal'
import Pagination          from '../../components/common/Pagination'
import type { ApplicationFormData } from '../../components/jobs/ApplicationModal'

const PAGE_SIZE = 10

export default function ApplicationsPage() {
  const queryClient = useQueryClient()

  // ── Local UI state ────────────────────────────────────────
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [stageFilter, setStageFilter] = useState<number | null>(null)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editing, setEditing]         = useState<JobApplication | null>(null)

  // ── Query ─────────────────────────────────────────────────
  const { data, isLoading } = useQuery<PaginatedResponse<JobApplication>>({
    queryKey: ['applications', page, search, stageFilter],
    queryFn: () => applicationsApi.getAll({
      PageNumber:  page,
      PageSize:    PAGE_SIZE,
      SearchTerm:  search || undefined,
      Stage:       stageFilter ?? undefined,
    }).then(r => r.data),
    placeholderData: (prev) => prev, // keep old data while fetching next page
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

// ── Form submit handler ────────────────────────────────────
  const handleSubmit = async (formData: ApplicationFormData) => {
    // Convert date string to ISO datetime
    const appliedAt = new Date(formData.appliedAt).toISOString()

    if (editing) {
      await updateMutation.mutateAsync({
        id:   editing.id,
        data: {
          companyName:    formData.companyName,
          jobTitle:       formData.jobTitle,
          jobUrl:         formData.jobUrl || undefined,
          location:       formData.location || undefined,
          employmentType: formData.employmentType as EmploymentType, 
          appliedAt,
          notes:          formData.notes || undefined,
        },
      })
    } else {
      await createMutation.mutateAsync({
        companyName:    formData.companyName,
        jobTitle:       formData.jobTitle,
        jobUrl:         formData.jobUrl || undefined,
        location:       formData.location || undefined,
        employmentType: formData.employmentType as EmploymentType, 
        appliedAt,
        notes:          formData.notes || undefined,
      })
    }
  }

  const handleEdit = (app: JobApplication) => {
    setEditing(app)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditing(null)
  }

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(1)
  }

  const handleStageFilter = (v: number | null) => {
    setStageFilter(v)
    setPage(1)
  }

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending

  const applications = data?.items ?? []
  const totalPages   = data?.totalPages ?? 1

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-5">

        {/* Filter bar */}
        <ApplicationsFilter
          search={search}
          onSearch={handleSearch}
          stageFilter={stageFilter}
          onStageFilter={handleStageFilter}
          onAdd={handleAdd}
        />

        {/* Table */}
        <ApplicationsTable
          applications={applications}
          isLoading={isLoading}
          onEdit={handleEdit}
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

      {/* Modal */}
      <ApplicationModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initial={editing}
        isLoading={isMutating}
      />
    </>
  )
}