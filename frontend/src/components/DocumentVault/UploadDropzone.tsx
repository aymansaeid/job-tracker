import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Loader2, Server } from 'lucide-react'
import { useDocumentStore } from '../../store/useDocumentStore'
import { cn } from '../../lib/utils'

const MAX_LIMITS: Record<number, number> = { 1: 5, 2: 10, 3: 5 }

export default function UploadDropzone({ activeTab }: { activeTab: number }) {
  const { documents, uploadDocument, isUploading } = useDocumentStore()

  const activeDocuments = documents.filter((d) => d.category === activeTab)
  const currentLimit = MAX_LIMITS[activeTab]
  const isLimitReached = activeDocuments.length >= currentLimit

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || isLimitReached) return
      try {
        await uploadDocument(acceptedFiles[0], activeTab, false)
      } catch (error) {
        // Zustand handles error state
      }
    },
    [activeTab, isLimitReached, uploadDocument]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 5 * 1024 * 1024,
    disabled: isLimitReached || isUploading,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
  })

  return (
    <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col">
      {/* Storage Header */}
      <div className="bg-white/[0.02] border-b border-white/[0.04] p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Server size={14} /> Storage Usage
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-md border",
          isLimitReached 
            ? "bg-red-500/10 text-red-400 border-red-500/20" 
            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        )}>
          {activeDocuments.length} / {currentLimit} Files
        </span>
      </div>

      {/* Drop Area */}
      <div className="p-5">
        {!isLimitReached ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300",
              isDragActive
                ? "border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]"
            )}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 shadow-inner">
                  <Loader2 size={24} className="text-cyan-400 animate-spin" />
                </div>
                <p className="text-slate-200 font-bold text-sm mb-1.5">Encrypting & Saving...</p>
              </div>
            ) : (
              <>
                <div className={cn(
                  "w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 shadow-inner transition-colors",
                  isDragActive 
                    ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" 
                    : "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10 text-slate-400"
                )}>
                  <UploadCloud size={20} />
                </div>
                <p className="text-slate-200 font-bold text-sm mb-1.5">
                  {isDragActive ? 'Drop payload here' : 'Select or drop file'}
                </p>
                <p className="text-slate-500 text-[11px] font-medium tracking-wide">
                  PDF, DOCX, JPG, PNG (Max 5MB)
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
              <span className="text-red-400 text-lg">⚠️</span>
            </div>
            <p className="text-sm font-bold text-red-400 mb-1">Limit Reached</p>
            <p className="text-xs text-red-400/70 font-medium">Delete an older file to free up space.</p>
          </div>
        )}
      </div>
    </div>
  )
}