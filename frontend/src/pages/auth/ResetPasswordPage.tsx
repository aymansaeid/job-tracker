import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '../../lib/api'
import { extractApiError } from '../../lib/utils'
import type { Variants } from 'framer-motion'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'At least one uppercase letter').regex(/[0-9]/, 'At least one number'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})
type FormData = z.infer<typeof schema>

const cardVariants: Variants = {
  initial: { opacity: 0, y: 32, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') // 👈 GRABS TOKEN FROM URL

  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [serverErr, setServerErr] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setServerErr("Missing reset token. Please use the exact link from your email.")
      return
    }

    setServerErr(null)
    try {
      await authApi.resetPassword({ token, newPassword: data.password })
      toast.success('Password successfully reset!')
      navigate('/login', { replace: true })
    } catch (err) {
      setServerErr(extractApiError(err))
    }
  }

  // Security check: If someone navigates here without a token, show an error.
  if (!token) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
        <div className="glass p-8 rounded-2xl text-center max-w-sm">
          <AlertCircle size={32} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-white font-bold text-lg mb-2">Invalid Link</h2>
          <p className="text-slate-400 text-sm mb-6">This password reset link is invalid or missing its security token.</p>
          <Link to="/forgot-password" className="text-cyan-400 hover:underline text-sm font-semibold">Request a new link</Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden">
      <div className="orb w-96 h-96 -top-24 -right-24 opacity-20" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)' }} />
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      <motion.div variants={cardVariants} initial="initial" animate="animate" className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-violet-500/20 blur-sm" />

        <div className="glass-raised relative rounded-2xl p-8">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-bold text-white mb-1">Create new password</h1>
            <p className="text-slate-400 text-sm">Please enter your new strong password below.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverErr && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{serverErr}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="input-glass w-full pr-12" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> {errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <input {...register('confirm')} type={showCf ? 'text' : 'password'} placeholder="••••••••" className="input-glass w-full pr-12" />
                <button type="button" onClick={() => setShowCf(!showCf)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> {errors.confirm.message}</p>}
            </div>

            <motion.button type="submit" disabled={isSubmitting} whileHover={isSubmitting ? {} : { scale: 1.02, y: -1 }} whileTap={isSubmitting ? {} : { scale: 0.98 }} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : 'Reset Password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}