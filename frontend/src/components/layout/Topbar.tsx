import { motion } from 'framer-motion'
import { Bell, RefreshCw, Link as LinkIcon, Sparkles, Clock } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { suggestionsApi, integrationsApi } from '../../lib/api'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { NAV_ITEMS } from './navConfig'
import { extractApiError } from '../../lib/utils'
import { notify } from '../../lib/toast'

const SYNC_COOLDOWN_KEY = 'gmailSyncRetryAt'

export default function Topbar({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user)
  const setGmailConnected = useAuthStore((s) => s.setGmailConnected)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const [syncing, setSyncing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [retryAt, setRetryAt] = useState<number | null>(() => {
    const stored = localStorage.getItem(SYNC_COOLDOWN_KEY)
    return stored ? Number(stored) : null
  })
  const [remainingMinutes, setRemainingMinutes] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tick the countdown every second while a cooldown is active
  useEffect(() => {
    if (!retryAt) {
      setRemainingMinutes(0)
      return
    }

    const tick = () => {
      const msLeft = retryAt - Date.now()
      if (msLeft <= 0) {
        setRetryAt(null)
        setRemainingMinutes(0)
        localStorage.removeItem(SYNC_COOLDOWN_KEY)
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }
      setRemainingMinutes(Math.ceil(msLeft / 60000))
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [retryAt])

  const handleSync = useCallback(async () => {
    setSyncing(true)
    try {
      await suggestionsApi.sync()
      await queryClient.invalidateQueries({ queryKey: ['suggestions'] })
      notify.success('Gmail sync complete!')
    } catch (error: any) {
      if (error?.response?.status === 429) {
        const minutes = error?.response?.data?.retryAfterMinutes ?? 60
        const until = Date.now() + minutes * 60_000
        setRetryAt(until)
        localStorage.setItem(SYNC_COOLDOWN_KEY, String(until))
        notify.error(error?.response?.data?.message ?? `You can sync again in ${minutes} minute(s).`)
      } else if (error?.response?.status !== 403) {
        notify.error(`Sync failed: ${extractApiError(error)}`)
      }
    } finally {
      setSyncing(false)
    }
  }, [queryClient])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'google_auth_success') {
        setGmailConnected()
        setIsConnecting(false)
        notify.success('Gmail connected successfully!')
        handleSync()
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setGmailConnected, handleSync])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await integrationsApi.getGoogleAuthUrl()
      window.open(response.data.url, 'GoogleAuth', 'width=500,height=600')
    } catch (error) {
      notify.error(`Connection failed: ${extractApiError(error)}`)
      setIsConnecting(false)
    }
  }

  const PageIcon = NAV_ITEMS.find((item) => item.to === pathname)?.icon ?? Sparkles
  const isCoolingDown = !!retryAt && remainingMinutes > 0

  return (
<header className="glass relative flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-6">

      <motion.div
        key={title}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-3"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] shadow-inner">
          <PageIcon size={15} className="text-cyan-400" />
        </div>
        <h1 className="font-display text-lg font-bold tracking-wide text-white">{title}</h1>
      </motion.div>

      <div className="relative z-10 flex items-center gap-3">
        {user?.isGmailConnected ? (
          <motion.button
            whileHover={{ scale: isCoolingDown ? 1 : 1.03 }}
            whileTap={{ scale: isCoolingDown ? 1 : 0.97 }}
            onClick={handleSync}
            disabled={syncing || isCoolingDown}
            title={isCoolingDown ? `Next sync available in ${remainingMinutes} minute(s)` : undefined}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-400 shadow-lg shadow-cyan-500/10 transition-colors hover:bg-cyan-500/20 disabled:opacity-60"
          >
            {isCoolingDown ? (
              <>
                <Clock size={13} />
                Next sync in {remainingMinutes}m
              </>
            ) : (
              <>
                <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing…' : 'Sync Gmail'}
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold text-violet-400 shadow-lg shadow-violet-500/10 transition-colors hover:bg-violet-500/20 disabled:opacity-60"
          >
            <LinkIcon size={13} />
            {isConnecting ? 'Connecting…' : 'Connect Gmail'}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-raised relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:text-cyan-400"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/app/settings')}
          title="Account settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg transition-shadow hover:shadow-cyan-500/40"
        >
          <span className="text-sm font-bold text-white shadow-sm">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </span>
        </motion.button>
      </div>
    </header>
  )
}