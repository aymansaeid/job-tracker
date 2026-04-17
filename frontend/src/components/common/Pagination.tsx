import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Props {
  currentPage:  number
  totalPages:   number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Show max 5 page buttons
  const visible = pages.filter(p =>
    p === 1 || p === totalPages ||
    Math.abs(p - currentPage) <= 1
  )

  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">

      {/* Prev */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 rounded-lg glass border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={14} />
      </motion.button>

      {/* Page numbers */}
      {visible.map((page, i) => {
        const prev = visible[i - 1]
        const showEllipsis = prev && page - prev > 1

        return (
          <div key={page} className="flex items-center gap-1.5">
            {showEllipsis && (
              <span className="text-slate-600 text-xs px-1">…</span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(page)}
              className={cn(
                'w-8 h-8 rounded-lg text-xs font-semibold transition-all border',
                page === currentPage
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white',
              )}
            >
              {page}
            </motion.button>
          </div>
        )
      })}

      {/* Next */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 rounded-lg glass border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={14} />
      </motion.button>

    </div>
  )
}