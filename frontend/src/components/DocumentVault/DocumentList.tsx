import { motion } from 'framer-motion'
import { FileText, Trash2, ExternalLink, Sparkles } from 'lucide-react'
import { useDocumentStore } from '../../store/useDocumentStore'
import { timeAgo, cn } from '../../lib/utils'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

export default function DocumentList({ activeTab }: { activeTab: number }) {
  const { documents, deleteDocument, setPrimary } = useDocumentStore()

  const activeDocuments = documents.filter(
    (doc) => doc.category === activeTab,
  )

  if (activeDocuments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4 shadow-inner">
          <FileText size={24} className="text-slate-600" />
        </div>
        <p className="text-slate-300 font-bold text-sm mb-1.5">No files found</p>
        <p className="text-slate-500 text-xs font-medium">
          Upload your first document to populate this vault.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
      {activeDocuments.map((doc, i) => (
        <motion.div
          key={doc.id}
          layout
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{
            duration: 0.4,
            delay: i * 0.05,
            ease: EASE,
          }}
          className={cn(
            'group relative flex flex-col overflow-hidden p-4 bg-white/[0.02] border rounded-xl transition-colors',
            doc.isPrimary
              ? 'border-amber-500/25 hover:border-amber-500/40'
              : 'border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10',
          )}
        >
          {doc.isPrimary && (
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400 opacity-[0.12] blur-[60px]" />
          )}

          {/* Header */}
          <div className="relative flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm transition-colors',
                  doc.isPrimary
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    : 'bg-white/[0.05] border-white/10 text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20',
                )}
              >
                <FileText size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-200 truncate pr-2">
                  {doc.fileName}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">
                    {(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                  </span>

                  <span className="text-[10px] text-slate-500 font-medium font-mono">
                    {timeAgo(doc.uploadedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <a
                href={doc.filePath}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                title="Open File"
              >
                <ExternalLink size={14} />
              </a>

              <button
                onClick={() => deleteDocument(doc.id)}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Primary control */}
          {activeTab === 1 && (
            <div className="relative mt-auto pt-3 border-t border-white/[0.04] flex justify-between items-center">
              {doc.isPrimary ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  <Sparkles size={12} /> Primary CV
                </span>
              ) : (
                <button
                  onClick={() => setPrimary(doc.id)}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
                >
                  Set as Primary
                </button>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}