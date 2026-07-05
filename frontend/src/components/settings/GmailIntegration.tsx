import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, CheckCircle2, Unlink, Loader2,
  ExternalLink, AlertCircle, Sparkles, Shield, RefreshCw
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../store/authStore'
import { integrationsApi, usersApi } from '../../lib/api'
import { AxiosError } from 'axios'
import type { User } from '../../types'
import { CometPanel } from '../common/CometPanel'

export default function GmailIntegration() {
  const user = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)

  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [serverErr, setServerErr] = useState<string | null>(null)

  const isConnected = !!user?.googleRefreshToken

  const fetchProfile = useCallback(async () => {
    if (!user?.id) { setFetching(false); return }
    try {
      const res = await usersApi.getProfile()
      setUser(res.data as User)
    } catch {
      // ignore — we tried
    } finally {
      setFetching(false)
    }
  }, [user?.id, setUser])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleConnect = async () => {
    setLoading(true)
    setServerErr(null)
    try {
      const res = await integrationsApi.getGoogleAuthUrl()
      const url = res.data?.url as string
      if (!url) throw new Error('No auth URL returned')

      const popup = window.open(url, 'gmail-oauth', 'width=600,height=700,left=400,top=100,scrollbars=yes')

      if (!popup) {
        window.location.href = url
        return
      }

      const handleMessage = async (event: MessageEvent) => {
        if (event.data === 'google_auth_success') {
          window.removeEventListener('message', handleMessage)
          setLoading(false)
          setFetching(true)
          await fetchProfile()
        }
      }

      window.addEventListener('message', handleMessage)
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
      if (user) setUser({ ...user, googleRefreshToken: undefined })
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>
      setServerErr(e.response?.data?.message ?? 'Failed to disconnect Gmail.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Was: <div className="glass rounded-2xl overflow-hidden"> — this is the
          one settings surface that deserves the comet treatment, since it's the
          switch that powers AI Suggestions. */}
      <CometPanel duration={11} contentClassName="overflow-hidden">

        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
              <Mail size={18} className="text-red-400" />
            </div>
            <div>
              <p className="font-display font-bold text-white">Gmail</p>
              <p className="text-xs text-slate-500">AI email scanning</p>
            </div>
          </div>

          {fetching ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <Loader2 size={11} className="animate-spin text-slate-500" />
              <span className="text-[11px] text-slate-500">Checking…</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span className="text-[11px] font-semibold text-slate-500">Not connected</span>
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">

          <AnimatePresence>
            {!fetching && isConnected && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4"
              >
                <div className="flex items-start gap-3">
                  <Sparkles size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-300 mb-0.5">AI scanning is active</p>
                    <p className="text-xs text-emerald-400/70 leading-relaxed">
                      Gmail is connected. Use "Sync Gmail" in the top bar to scan for new interview invites, rejections, and offers.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isConnected && !fetching && (
            <p className="text-sm text-slate-400 leading-relaxed">
              Connect your Gmail so our AI can detect interview invites, rejections, and offers — surfacing them as one-click suggestions on your dashboard.
            </p>
          )}

          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={12} className="text-slate-500" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Privacy & Access</p>
            </div>
            {[
              'Read-only access to email subjects and senders',
              'Detects job-related keywords and patterns only',
              'Your email content is never stored or shared',
            ].map(item => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500">{item}</p>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {serverErr && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3"
              >
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{serverErr}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!fetching && (
            <div className="flex items-center gap-3 pt-1">
              {isConnected ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
                  >
                    {loading ? <><Loader2 size={13} className="animate-spin" /> Disconnecting…</> : <><Unlink size={13} /> Disconnect</>}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setFetching(true); fetchProfile() }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <RefreshCw size={13} /> Refresh status
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                  onClick={handleConnect}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-glow-cyan disabled:opacity-60"
                >
                  {loading ? <><Loader2 size={13} className="animate-spin" /> Opening…</> : <><ExternalLink size={13} /> Connect Gmail</>}
                </motion.button>
              )}
            </div>
          )}

        </div>
      </CometPanel>
    </div>
  )
}