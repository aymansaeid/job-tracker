import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle2, Unlink, Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { integrationsApi } from '../../lib/api'
import { AxiosError } from 'axios'

export default function GmailIntegration() {
  const user    = useAuthStore(s => s.user)
  const setAuth = useAuthStore(s => s.setAuth)
  const token   = useAuthStore(s => s.token)

  // If googleRefreshToken exists on the user → Gmail is connected
  const isConnected = !!user?.googleRefreshToken

  const [loading,   setLoading]   = useState(false)
  const [serverErr, setServerErr] = useState<string | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    setServerErr(null)
    try {
      const res  = await integrationsApi.getGoogleAuthUrl()
      const url  = res.data?.url as string
      if (url) {
        // Redirect to Google OAuth
        window.location.href = url
      }
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>
      setServerErr(e.response?.data?.message ?? 'Failed to get Google auth URL.')
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    setServerErr(null)
    try {
      await integrationsApi.disconnect()
      // Clear token from local user state
      if (user && token) {
        setAuth({ ...user, googleRefreshToken: undefined }, token)
      }
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>
      setServerErr(e.response?.data?.message ?? 'Failed to disconnect Gmail.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass rounded-2xl border border-white/10 p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-white mb-1">Gmail Integration</h3>
          <p className="text-slate-400 text-sm">
            Connect your Gmail so our AI can scan for interview invites,
            rejections, and offers automatically.
          </p>
        </div>
        {/* Gmail icon */}
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
          <Mail size={22} className="text-red-400" />
        </div>
      </div>

      {/* Status banner */}
      <AnimatePresence mode="wait">
        {isConnected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 mb-6"
          >
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">Gmail Connected</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">
                AI suggestions are active. Use "Sync Gmail" in the top bar anytime.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-3 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
            <p className="text-sm text-slate-400">
              Gmail not connected — AI suggestions are disabled.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What we access */}
      <div className="space-y-2.5 mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          What we access
        </p>
        {[
          'Read-only access to email subjects and senders',
          'Detect job-related keywords and patterns',
          'We never store or share your email content',
        ].map(item => (
          <div key={item} className="flex items-start gap-2.5">
            <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400">{item}</p>
          </div>
        ))}
      </div>

      {/* Server error */}
      <AnimatePresence>
        {serverErr && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 mb-4"
          >
            <AlertCircle size={15} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{serverErr}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action button */}
      {isConnected ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDisconnect}
          disabled={loading}
          className="btn-ghost flex items-center gap-2 px-5 py-2.5 text-sm border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-60"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Disconnecting…</>
            : <><Unlink size={14} /> Disconnect Gmail</>
          }
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnect}
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 shadow-glow-cyan disabled:opacity-60"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Redirecting…</>
            : <><ExternalLink size={14} /> Connect Gmail</>
          }
        </motion.button>
      )}

    </div>
  )
}