import { create } from 'zustand'
import { documentsApi } from '../lib/api'

export interface UserDocument {
  id: number
  fileName: string
  filePath: string
  fileSizeBytes: number
  category: number
  isPrimary: boolean
  uploadedAt: string
}

interface DocumentStore {
  documents: UserDocument[]
  isLoading: boolean
  isUploading: boolean
  error: string | null
  fetchDocuments: () => Promise<void>
  uploadDocument: (file: File, category: number, isPrimary?: boolean) => Promise<void>
  deleteDocument: (id: number) => Promise<void>
  setPrimary: (id: number) => Promise<void>
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  isLoading: false,
  isUploading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await documentsApi.getAll()
      set({ documents: data, isLoading: false })
    } catch (err: any) {
      set({ error: 'Failed to fetch documents', isLoading: false })
    }
  },

  uploadDocument: async (file, category, isPrimary = false) => {
    set({ isUploading: true, error: null })
    try {
      await documentsApi.upload(file, category, isPrimary)
      await get().fetchDocuments() // Refresh the vault
      set({ isUploading: false })
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload document.'
      set({ error: msg, isUploading: false })
      throw new Error(msg) 
    }
  },

  deleteDocument: async (id) => {
    try {
      await documentsApi.delete(id)
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id)
      }))
    } catch (err) {
      console.error('Delete failed', err)
    }
  },

  setPrimary: async (id) => {
    try {
      await documentsApi.setPrimary(id)
      await get().fetchDocuments()
    } catch (err) {
      console.error('Set primary failed', err)
    }
  }
}))