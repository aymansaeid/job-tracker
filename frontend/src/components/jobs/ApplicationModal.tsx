import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EmploymentType } from '../../types'
import type { JobApplication } from '../../types'
import { EMPLOYMENT_LABEL } from '../../lib/utils'

const schema = z.object({
  companyName:    z.string().min(1, 'Company name is required'),
  jobTitle:       z.string().min(1, 'Job title is required'),
  jobUrl:         z.string().url('Must be a valid URL').optional().or(z.literal('')),
  location:       z.string().optional(),
  employmentType: z.number(), // Switched from coerce to standard number
  appliedAt:      z.string().min(1, 'Date is required'),
  notes:          z.string().optional(),
})

export type ApplicationFormData = z.infer<typeof schema>

interface Props {
  open:       boolean
  onClose:    () => void
  onSubmit:   (data: ApplicationFormData) => Promise<void>
  initial?:   JobApplication | null   // if set → edit mode
  isLoading:  boolean
}

export default function ApplicationModal({
  open, onClose, onSubmit, initial, isLoading,
}: Props) {
  const isEdit = !!initial

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ApplicationFormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        employmentType: EmploymentType.FullTime,
        appliedAt: new Date().toISOString().split('T')[0],
      },
    })

  // Populate form when editing
  useEffect(() => {
    if (initial) {
      reset({
        companyName:    initial.companyName,
        jobTitle:       initial.jobTitle ?? '',
        jobUrl:         initial.jobUrl ?? '',
        location:       initial.location ?? '',
        employmentType: initial.employmentType,
        appliedAt:      initial.appliedAt.split('T')[0],
        notes:          initial.notes ?? '',
      })
    } else {
      reset({
        companyName:    '',
        jobTitle:       '',
        jobUrl:         '',
        location:       '',
        employmentType: EmploymentType.FullTime,
        appliedAt:      new Date().toISOString().split('T')[0],
        notes:          '',
      })
    }
  }, [initial, open, reset])

  const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2'
  const errorClass = 'text-xs text-red-400 mt-1.5'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95,  y: 20 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass rounded-2xl border border-white/10 shadow-card w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
                <h2 className="font-display font-bold text-white">
                  {isEdit ? 'Edit Application' : 'Add Application'}
                </h2>
                <button onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

                {/* Company + Job Title */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Company *</label>
                    <input {...register('companyName')} placeholder="Google"
                           className="input-glass" />
                    {errors.companyName && <p className={errorClass}>{errors.companyName.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Job Title *</label>
                    <input {...register('jobTitle')} placeholder="Software Engineer"
                           className="input-glass" />
                    {errors.jobTitle && <p className={errorClass}>{errors.jobTitle.message}</p>}
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className={labelClass}>Job URL</label>
                  <input {...register('jobUrl')} placeholder="https://careers.google.com/..."
                         className="input-glass" />
                  {errors.jobUrl && <p className={errorClass}>{errors.jobUrl.message}</p>}
                </div>

                {/* Location + Employment Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Location</label>
                    <input {...register('location')} placeholder="Remote, New York…"
                           className="input-glass" />
                  </div>
                  <div>
                    <label className={labelClass}>Employment Type</label>
                    {/* Handled the number conversion natively right here */}
                    <select {...register('employmentType', { valueAsNumber: true })}
                            className="input-glass bg-surface-elevated cursor-pointer">
                      {Object.entries(EMPLOYMENT_LABEL).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Applied At */}
                <div>
                  <label className={labelClass}>Applied Date *</label>
                  <input {...register('appliedAt')} type="date"
                         className="input-glass cursor-pointer" />
                  {errors.appliedAt && <p className={errorClass}>{errors.appliedAt.message}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea {...register('notes')} rows={3}
                            placeholder="Recruiter name, referral, anything useful…"
                            className="input-glass resize-none" />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3">
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={isLoading ? {} : { scale: 1.02 }}
                    whileTap={isLoading ? {} : { scale: 0.98 }}
                    className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isLoading
                      ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                      : isEdit ? 'Save Changes' : 'Add Application'
                    }
                  </motion.button>
                </div>

              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}