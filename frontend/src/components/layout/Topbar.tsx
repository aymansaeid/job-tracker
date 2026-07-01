import { motion } from 'framer-motion'
import { Bell, RefreshCw, Link as LinkIcon } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { suggestionsApi, integrationsApi } from '../../lib/api'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export default function Topbar({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user)
  const setGmailConnected = useAuthStore((s) => s.setGmailConnected)
  const queryClient = useQueryClient()
  
  const [syncing, setSyncing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // ── Listener for Google Popup Success ──
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // This matches the string we sent from the C# GoogleCallback HTML
      if (event.data === 'google_auth_success') {
         setGmailConnected()
         setIsConnecting(false)
         // Automatically trigger a sync now that we are connected!
         handleSync() 
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await suggestionsApi.sync()
      await queryClient.invalidateQueries({ queryKey: ['suggestions'] })
    } catch {
      // The Axios interceptor automatically handles the 403 error now!
    } finally {
      setSyncing(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await integrationsApi.getGoogleAuthUrl()
      // Open the Google OAuth window as a slick popup
      window.open(response.data.url, 'GoogleAuth', 'width=500,height=600')
    } catch {
      setIsConnecting(false)
    }
  }

  return (
    <header className="h-16 border-b border-white/[0.07] flex items-center justify-between px-6 shrink-0">

      <motion.h1
        key={title}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display font-bold text-white text-lg"
      >
        {title}
      </motion.h1>

      <div className="flex items-center gap-3">

        {/* ── Conditional Button Render ── */}
        {user?.isGmailConnected ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync Gmail'}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/20 transition-colors disabled:opacity-60"
          >
            <LinkIcon size={13} />
            {isConnecting ? 'Connecting…' : 'Connect Gmail'}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </motion.button>

        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
          </span>
        </div>

      </div>
    </header>
  )
}