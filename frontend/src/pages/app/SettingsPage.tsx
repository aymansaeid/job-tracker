import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { User, Lock, Mail, ChevronRight, Sparkles } from 'lucide-react'
import ProfileForm      from '../../components/settings/ProfileForm'
import PasswordForm     from '../../components/settings/PasswordForm'
import GmailIntegration from '../../components/settings/GmailIntegration'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'

const SECTIONS = [
  {
    id: 'profile', label: 'Profile', description: 'Your name and email',
    icon: User, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'password', label: 'Password', description: 'Change your password',
    icon: Lock, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    id: 'integrations', label: 'Integrations', description: 'Gmail & AI scanning',
    icon: Mail, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20',
  },
] as const

type SectionId = typeof SECTIONS[number]['id']

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('profile')
  const user = useAuthStore(s => s.user)

  const activeSection = SECTIONS.find(s => s.id === active)!

  return (
    <div className="flex gap-6 items-start">

      <div className="w-64 shrink-0 space-y-3">

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-white text-lg">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-white text-sm truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          {SECTIONS.map((section, i) => {
            const isActive = active === section.id
            return (
              <motion.button
                key={section.id}
                onClick={() => setActive(section.id)}
                whileHover={{ x: isActive ? 0 : 2 }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all relative',
                  i !== 0 && 'border-t border-white/[0.05]',
                  isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="settings-active"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 to-violet-500 rounded-r"
                    transition={{ duration: 0.2 }}
                  />
                )}

                <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center shrink-0', section.bg)}>
                  <section.icon size={15} className={section.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold truncate', isActive ? 'text-white' : 'text-slate-300')}>
                    {section.label}
                  </p>
                  <p className="text-[10px] text-slate-600 truncate">{section.description}</p>
                </div>

                <ChevronRight
                  size={13}
                  className={cn('shrink-0 transition-colors', isActive ? 'text-slate-400' : 'text-slate-700')}
                />
              </motion.button>
            )
          })}
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} className="text-cyan-400" />
            <p className="text-xs font-bold text-slate-400">JobTracker AI</p>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Connect Gmail to unlock AI-powered suggestions that automatically
            detect your interview invites and rejections.
          </p>
        </div>

      </div>

      <div className="flex-1 min-w-0">

        <motion.div
          key={active}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center', activeSection.bg)}>
            <activeSection.icon size={18} className={activeSection.color} />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">{activeSection.label}</h2>
            <p className="text-xs text-slate-500">{activeSection.description}</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
          >
            {active === 'profile'      && <ProfileForm />}
            {active === 'password'     && <PasswordForm />}
            {active === 'integrations' && <GmailIntegration />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}