import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { usersApi } from '../../lib/api'
import { AxiosError } from 'axios'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[0-9]/, 'At least one number'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function PasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverErr, setServerErr] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setSuccess(false)
    setServerErr(null)
    try {
      await usersApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>
      setServerErr(e.response?.data?.message ?? 'Failed to change password.')
    }
  }

  const labelClass = 'block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2'

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-bold text-white mb-1">Password</h3>
      <p className="text-slate-400 text-sm mb-6">Change your account password.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <div>
          <label className={labelClass}>Current Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input {...register('currentPassword')} type={showCurrent ? 'text' : 'password'} placeholder="••••••••" className="input-glass pl-10 pr-12" />
            <button type="button" onClick={() => setShowCurrent(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> {errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>New Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input {...register('newPassword')} type={showNew ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" className="input-glass pl-10 pr-12" />
            <button type="button" onClick={() => setShowNew(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> {errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Confirm New Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter new password" className="input-glass pl-10 pr-12" />
            <button type="button" onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> {errors.confirmPassword.message}</p>
          )}
        </div>

        {serverErr && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3">
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{serverErr}</p>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300">Password changed successfully.</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={isSubmitting ? {} : { scale: 1.02, y: -1 }}
          whileTap={isSubmitting ? {} : { scale: 0.98 }}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : 'Update Password'}
        </motion.button>

      </form>
    </div>
  )
}