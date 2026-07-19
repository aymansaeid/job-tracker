import { motion } from 'framer-motion'
import { Bell, RefreshCw, Link as LinkIcon, Sparkles, Clock, Menu } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { suggestionsApi, integrationsApi, usersApi } from '../../lib/api'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { NAV_ITEMS } from './navConfig'
import { extractApiError } from '../../lib/utils'
import { notify } from '../../lib/toast'
import type { User } from '../../types'

const SYNC_COOLDOWN_KEY = 'gmailSyncRetryAt'

interface TopbarProps {
  title: string
  onMenuClick?: () => void
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
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

  const isGmailConnected = useAuthStore(
    (s) => s.isGmailConnected || !!s.user?.googleRefreshToken || !!(s.user as any)?.isGmailConnected
  )

  useEffect(() => {
    if (user && !isGmailConnected) {
      usersApi.getProfile()
        .then((res) => {
          if (res.data) setUser(res.data as Partial<User>)
        })
        .catch(() => {
        })
    }
  }, [])

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
    const handleMessage = async (event: MessageEvent) => {
      if (event.data === 'google_auth_success') {
        setIsConnecting(false)
        try {
          const res = await usersApi.getProfile()
          // Explicitly force isGmailConnected to true so the UI updates instantly
          setUser({ ...res.data, isGmailConnected: true } as Partial<User>)
          notify.success('Gmail connected successfully!')
          handleSync()
        } catch {
          notify.error('Connected, but failed to refresh account status — try reloading.')
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setUser, handleSync])

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await integrationsApi.getGoogleAuthUrl()
      const url = response.data?.url as string
      if (!url) throw new Error('No auth URL returned')

      const width = 500
      const height = 600
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const popup = window.open(url, 'GoogleAuth', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`)

      if (!popup) {
        window.location.href = url
        return
      }
    } catch (error) {
      notify.error(`Connection failed: ${extractApiError(error)}`)
      setIsConnecting(false)
    }
  }

  const PageIcon = NAV_ITEMS.find((item) => item.to === pathname)?.icon ?? Sparkles
  const isCoolingDown = !!retryAt && remainingMinutes > 0

  return (
    <header className="glass relative flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] px-4 sm:px-6">
      <div className="relative z-10 flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          title="Open Menu"
        >
          <Menu size={18} />
        </button>

        <motion.div
          key={title}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] shadow-inner sm:flex">
            <PageIcon size={15} className="text-cyan-400" />
          </div>
          <h1 className="font-display text-base font-bold tracking-wide text-white sm:text-lg">{title}</h1>
        </motion.div>
      </div>

      <div className="relative z-10 flex items-center gap-2 sm:gap-3">
        {isGmailConnected ? (
          <motion.button
            whileHover={{ scale: isCoolingDown ? 1 : 1.03 }}
            whileTap={{ scale: isCoolingDown ? 1 : 0.97 }}
            onClick={handleSync}
            disabled={syncing || isCoolingDown}
            title={isCoolingDown ? `Next sync available in ${remainingMinutes} minute(s)` : undefined}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-2 text-xs font-semibold text-cyan-400 shadow-lg shadow-cyan-500/10 transition-colors hover:bg-cyan-500/20 disabled:opacity-60 sm:gap-2 sm:px-3.5"
          >
            {isCoolingDown ? (
              <>
                <Clock size={13} />
                <span className="hidden sm:inline">Next sync in </span>{remainingMinutes}m
              </>
            ) : (
              <>
                <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync Gmail'}</span>
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-1.5 rounded-xl border border-violet-500/25 bg-violet-500/10 px-2.5 py-2 text-xs font-semibold text-violet-400 shadow-lg shadow-violet-500/10 transition-colors hover:bg-violet-500/20 disabled:opacity-60 sm:gap-2 sm:px-3.5"
          >
            <LinkIcon size={13} />
            <span className="hidden sm:inline">{isConnecting ? 'Connecting…' : 'Connect Gmail'}</span>
            <span className="sm:hidden">{isConnecting ? '…' : 'Connect'}</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-raised relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:text-cyan-400"
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg transition-shadow hover:shadow-cyan-500/40"
        >
          <span className="text-sm font-bold text-white shadow-sm">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </span>
        </motion.button>
      </div>
    </header>
  )
}