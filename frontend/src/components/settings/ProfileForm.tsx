import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { usersApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { AxiosError } from 'axios'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
})
type FormData = z.infer<typeof schema>

export default function ProfileForm() {
  const user    = useAuthStore(s => s.user)
  const setAuth = useAuthStore(s => s.setAuth)
  const token   = useAuthStore(s => s.token)

  const [success, setSuccess] = useState(false)
  const [serverErr, setServerErr] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: { fullName: user?.fullName ?? '' },
    })

  const onSubmit = async (data: FormData) => {
    setSuccess(false)
    setServerErr(null)
    try {
      await usersApi.updateProfile({ fullName: data.fullName })
      // Update local store so topbar/sidebar reflect the change instantly
      if (user && token) {
        setAuth({ ...user, fullName: data.fullName }, token)
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>
      setServerErr(e.response?.data?.message ?? 'Failed to update profile.')
    }
  }

  return (
    <div className="glass rounded-2xl border border-white/10 p-6">
      <h3 className="font-display font-bold text-white mb-1">Profile</h3>
      <p className="text-slate-400 text-sm mb-6">Update your display name.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Full name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              {...register('fullName')}
              placeholder=""
              className="input-glass pl-10"
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email — read only */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              value={user?.email ?? ''}
              disabled
              className="input-glass pl-10 opacity-50 cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-1.5">
            Email cannot be changed.
          </p>
        </div>

        {/* Server error */}
        {serverErr && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3"
          >
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{serverErr}</p>
          </motion.div>
        )}

        {/* Success */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3"
          >
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300">Profile updated successfully.</p>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={isSubmitting ? {} : { scale: 1.02, y: -1 }}
          whileTap={isSubmitting ? {} : { scale: 0.98 }}
          className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
            : 'Save Changes'
          }
        </motion.button>

      </form>
    </div>
  )
}