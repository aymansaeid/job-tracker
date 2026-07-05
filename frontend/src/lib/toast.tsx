import toast, { type Toast } from 'react-hot-toast'
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CometPanel } from '../components/common/CometPanel'
import { cn } from './utils'

type Variant = 'success' | 'error' | 'loading'

const VARIANT_META: Record<Variant, { icon: LucideIcon; color: string }> = {
  success: { icon: CheckCircle2, color: '#33D6A6' },
  error:   { icon: XCircle,      color: '#FF6B81' },
  loading: { icon: Loader2,      color: '#22D3EE' },
}

function ToastCard({ t, variant, message }: { t: Toast; variant: Variant; message: string }) {
  const meta = VARIANT_META[variant]
  const Icon = meta.icon

  return (
    // react-hot-toast keeps custom toasts mounted during their exit animation
    // and flips `t.visible` to false — this transition is what gives the
    // slide-down-in / fade-up-out motion, no extra library needed.
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        t.visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
      )}
    >
      <CometPanel duration={9} contentClassName="flex min-w-[280px] max-w-sm items-center gap-3 px-4 py-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
          style={{ background: `${meta.color}1A`, borderColor: `${meta.color}33` }}
        >
          <Icon size={16} style={{ color: meta.color }} className={variant === 'loading' ? 'animate-spin' : ''} />
        </span>
        <p className="min-w-0 flex-1 text-left text-sm font-medium text-white">{message}</p>
        {variant !== 'loading' && (
          <button
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 text-slate-500 transition-colors hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </CometPanel>
    </div>
  )
}

export const notify = {
  success: (message: string) =>
    toast.custom((t) => <ToastCard t={t} variant="success" message={message} />, { duration: 3500 }),
  error: (message: string) =>
    toast.custom((t) => <ToastCard t={t} variant="error" message={message} />, { duration: 4500 }),
  loading: (message: string) =>
    toast.custom((t) => <ToastCard t={t} variant="loading" message={message} />, { duration: Infinity }),
}