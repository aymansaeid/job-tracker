import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import type { Variants } from 'framer-motion'
import { decodeJWT , extractApiError } from '../../lib/utils'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

const cardVariants: Variants = {
  initial: { opacity: 0, y: 32, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
}

const field = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPw, setShowPw] = useState(false)
  const [serverErr, setServerErr] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerErr(null)
    try {
      const res = await authApi.login(data)

      const responseData = res.data as any
      const token = responseData.token || responseData.Token
      const fullName = responseData.fullName || responseData.FullName
      const isConnected = responseData.isGmailConnected ?? responseData.IsGmailConnected ?? false

      const decoded = decodeJWT(token)
      const userId = (decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ?? decoded?.sub
        ?? decoded?.nameid
        ?? decoded?.id
        ?? 0) as number

      setAuth(
        {
          id: Number(userId),
          email: data.email,
          fullName: fullName || 'User',
          isGmailConnected: isConnected,
        },
        token,
      )
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      setServerErr(extractApiError(err))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-surface-base flex items-center justify-center px-4 relative overflow-hidden"
    >
      <div className="orb w-96 h-96 -top-24 -right-24 opacity-20"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)', animationDelay: '2s' }} />
      <div className="orb w-80 h-80 -bottom-20 -left-20 opacity-15"
           style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)', animationDelay: '6s' }} />
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
          <Sparkles size={15} className="text-white" />
        </div>
        <span className="font-display font-bold text-white">JobTracker</span>
      </Link>

      <motion.div variants={cardVariants} initial="initial" animate="animate" className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-violet-500/20 blur-sm" />

        {/* Was `glass ... shadow-card` — the utility shadow silently beat the
            .glass inset highlight in the cascade. glass-raised carries both
            correctly and matches the elevation of every other floating panel. */}
        <div className="glass-raised relative rounded-2xl p-8">
          <motion.div variants={stagger} initial="initial" animate="animate">

            <motion.div variants={field} className="mb-7">
              <h1 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h1>
              <p className="text-slate-400 text-sm">Sign in to your JobTracker account</p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {serverErr && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3">
                  <AlertCircle size={15} className="text-red-400" />
                  <p className="text-sm text-red-300">{serverErr}</p>
                </motion.div>
              )}

              <motion.div variants={field}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <input {...register('email')} type="email" placeholder="you@example.com"
                       autoComplete="email" className="input-glass" />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.email.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={field}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input {...register('password')} type={showPw ? 'text' : 'password'}
                         placeholder="••••••••" autoComplete="current-password" className="input-glass pr-12" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.password.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={field} className="pt-1">
                <motion.button type="submit" disabled={isSubmitting}
                               whileHover={isSubmitting ? {} : { scale: 1.02, y: -1 }}
                               whileTap={isSubmitting ? {} : { scale: 0.98 }}
                               className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting
                    ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                    : 'Sign in to JobTracker'
                  }
                </motion.button>
              </motion.div>

            </form>

            <motion.div variants={field} className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Create one free →
                </Link>
              </p>
            </motion.div>

          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}