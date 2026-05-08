import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen } from 'lucide-react'
import { useDocumentStore } from '../../store/useDocumentStore'
import VaultTabs from '../../components/DocumentVault/VaultTabs'
import UploadDropzone from '../../components/DocumentVault/UploadDropzone'
import DocumentList from '../../components/DocumentVault/DocumentList'

const CATEGORY_MAP = {
  RESUME: 1,
  CERTIFICATE: 2,
  IMPORTANT: 3,
}

export default function MyFoldersPage() {
  const { fetchDocuments, isLoading, error } = useDocumentStore()
  const [activeTab, setActiveTab] = useState<number>(CATEGORY_MAP.RESUME)

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <div className="space-y-10">
      {/* ── Header Section ────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-white/10 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <FolderOpen size={16} className="text-cyan-400" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-wide">
              Document Vault
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium ml-11">
            Securely manage your CVs, certificates, and critical documents.
          </p>
        </motion.div>
      </section>

      {/* ── Error State ───────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-2">
              <span className="text-lg">❌</span> {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[350px_1fr] gap-6 items-start">
        
        {/* LEFT COLUMN: Upload & Limits */}
        <section className="space-y-6 sticky top-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 mb-4">
              Upload
            </p>
            <UploadDropzone activeTab={activeTab} />
          </div>
        </section>

        {/* RIGHT COLUMN: Tabs & Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              My Files
            </p>
            <VaultTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="glass rounded-2xl border border-white/[0.07] min-h-[400px] p-2 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none rounded-full" />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4">
                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading Vault...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <DocumentList activeTab={activeTab} />
              </AnimatePresence>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}