import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2, Sparkles, ArrowLeft, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { authApi } from '../../lib/api'
import { extractApiError } from '../../lib/utils'
import type { Variants } from 'framer-motion'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})
type FormData = z.infer<typeof schema>

const cardVariants: Variants = {
  initial: { opacity: 0, y: 32, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
}

export default function ForgotPasswordPage() {
  const [serverErr, setServerErr] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerErr(null)
    try {
      await authApi.forgotPassword(data)
      setIsSuccess(true)
      toast.success('Reset link sent!')
    } catch (err) {
      setServerErr(extractApiError(err))
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden">
      <div className="orb w-96 h-96 -top-24 -right-24 opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)', animationDelay: '2s' }} />
      <div className="orb w-80 h-80 -bottom-20 -left-20 opacity-15" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)', animationDelay: '6s' }} />
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
          <Sparkles size={15} className="text-white" />
        </div>
        <span className="font-display font-bold text-white">JobTracker</span>
      </Link>

      <motion.div variants={cardVariants} initial="initial" animate="animate" className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-violet-500/20 blur-sm" />

        <div className="glass-raised relative rounded-2xl p-8 text-center">
          {isSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                <MailCheck size={24} />
              </div>
              <h1 className="font-display text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                If an account exists for that email, we've sent a secure link to reset your password. The link will expire in 30 minutes. Do not forget to check the spam box.
              </p>
              <Link to="/login" className="btn-primary w-full flex items-center justify-center py-3.5 text-sm font-semibold">
                Return to Login
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-7 text-left">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors mb-4 uppercase tracking-wider">
                  <ArrowLeft size={12} /> Back to login
                </Link>
                <h1 className="font-display text-2xl font-bold text-white mb-1">Reset Password</h1>
                <p className="text-slate-400 text-sm">Enter your email and we'll send you a secure reset link.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
                {serverErr && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3">
                    <AlertCircle size={15} className="text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">{serverErr}</p>
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Email address
                  </label>
                  <input {...register('email')} type="email" placeholder="you@example.com" autoComplete="email" className="input-glass w-full" />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={11} /> {errors.email.message}
                    </p>
                  )}
                </div>

                <motion.button type="submit" disabled={isSubmitting} whileHover={isSubmitting ? {} : { scale: 1.02, y: -1 }} whileTap={isSubmitting ? {} : { scale: 0.98 }} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Sending Link…</> : 'Send Reset Link'}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}