import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import type { AuthResponse } from '../../types'
import type { Variants } from 'framer-motion'
import { decodeJWT, extractApiError } from '../../lib/utils'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/[0-9]/, 'At least one number'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})
type FormData = z.infer<typeof schema>

function passwordStrength(pw: string) {
  if (!pw) return { score: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  if (s <= 1) return { score: s, label: 'Weak', color: 'bg-red-500' }
  if (s <= 2) return { score: s, label: 'Fair', color: 'bg-yellow-500' }
  if (s <= 3) return { score: s, label: 'Good', color: 'bg-blue-500' }
  return { score: s, label: 'Strong', color: 'bg-emerald-500' }
}

const cardVariants: Variants = {
  initial: { opacity: 0, y: 32, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.065, delayChildren: 0.2 } },
}

const field = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [pw, setPw] = useState('')
  const [serverErr, setServerErr] = useState<string | null>(null)
  const strength = useMemo(() => passwordStrength(pw), [pw])

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

const onSubmit = async (data: FormData) => {
    setServerErr(null)
    try {
      const res = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      })
      const { token } = res.data as AuthResponse

      const decoded = decodeJWT(token)
      const userId = (decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ?? decoded?.sub
        ?? decoded?.nameid
        ?? decoded?.id
        ?? 0) as number

      setAuth(
        { id: Number(userId), email: data.email, fullName: data.fullName },
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
      className="min-h-screen bg-surface-base flex items-center justify-center px-4 py-16 relative overflow-hidden"
    >
      <div className="orb w-96 h-96 -top-24 -left-24 opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)' }} />
      <div className="orb w-80 h-80 -bottom-20 -right-20 opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', animationDelay: '5s' }} />
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-10">
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
          <Sparkles size={15} className="text-white" />
        </div>
        <span className="font-display font-bold text-white">JobTracker</span>
      </Link>

      <motion.div variants={cardVariants} initial="initial" animate="animate" className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/15 via-transparent to-cyan-500/15 blur-sm" />

        <div className="glass-raised relative rounded-2xl p-8">
          <motion.div variants={stagger} initial="initial" animate="animate">

            <motion.div variants={field} className="mb-7">
              <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
              <p className="text-slate-400 text-sm">Free forever. No credit card required.</p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              <AnimatePresence>
                {serverErr && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3">
                    <AlertCircle size={15} className="text-red-400" />
                    <p className="text-sm text-red-300">{serverErr}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={field}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full name
                </label>
                <input {...register('fullName')} type="text" placeholder="Jane Doe"
                  autoComplete="name" className="input-glass" />
                {errors.fullName && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.fullName.message}
                  </p>
                )}
              </motion.div>

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
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input {...register('password', { onChange: e => setPw(e.target.value) })}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    autoComplete="new-password" className="input-glass pr-12" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <AnimatePresence>
                  {pw && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(seg => (
                          <div key={seg} className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              animate={{ width: strength.score >= seg ? '100%' : '0%' }}
                              transition={{ duration: 0.3 }}
                              className={`h-full ${strength.color}`}
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500">{strength.label} password</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.password && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.password.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={field}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input {...register('confirm')} type={showCf ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    autoComplete="new-password" className="input-glass pr-12" />
                  <button type="button" onClick={() => setShowCf(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> {errors.confirm.message}
                  </p>
                )}
              </motion.div>

              <motion.div variants={field} className="flex flex-wrap gap-x-4 gap-y-1.5">
                {['AI Gmail scanning', 'Kanban board', 'Application history'].map(item => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    {item}
                  </div>
                ))}
              </motion.div>

              <motion.div variants={field} className="pt-1">
                <motion.button type="submit" disabled={isSubmitting}
                  whileHover={isSubmitting ? {} : { scale: 1.02, y: -1 }}
                  whileTap={isSubmitting ? {} : { scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-cyan">
                  {isSubmitting
                    ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                    : <><Sparkles size={15} /> Create my free account</>
                  }
                </motion.button>
              </motion.div>

            </form>

            <motion.div variants={field} className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Sign in →
                </Link>
              </p>
            </motion.div>

          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}