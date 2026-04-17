import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7266/api'


export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const raw = localStorage.getItem('auth-storage')
  if (raw) {
    try {
      const { state } = JSON.parse(raw) as { state: { token?: string } }
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
    } catch { /* ignore */ }
  }
  return config
})

// 401 → clear auth + redirect
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ── Auth ─────────────────────────────────────────────────────
// POST /api/Auth/register
// POST /api/Auth/login

export const authApi = {
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post('/Auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/Auth/login', data),
}

// ── Applications ──────────────────────────────────────────────
// GET    /api/Applications          → PaginatedResponse<JobApplication>
// POST   /api/Applications
// GET    /api/Applications/stats    → DashboardStats
// GET    /api/Applications/{id}     → JobApplication
// PUT    /api/Applications/{id}
// DELETE /api/Applications/{id}
// PATCH  /api/Applications/{id}/stage
// PATCH  /api/Applications/{id}/archive
// GET    /api/Applications/{id}/history → HistoryEvent[]

export const applicationsApi = {
  getAll: (params?: {
    PageNumber?:      number
    PageSize?:        number
    SearchTerm?:      string
    Stage?:           number
    IncludeArchived?: boolean
  }) => api.get('/Applications', { params }),

  getById: (id: number) =>
    api.get(`/Applications/${id}`),

  create: (data: unknown) =>
    api.post('/Applications', data),

  update: (id: number, data: unknown) =>
    api.put(`/Applications/${id}`, data),

  delete: (id: number) =>
    api.delete(`/Applications/${id}`),

  changeStage: (id: number, data: { stage: number; comment?: string }) =>
    api.patch(`/Applications/${id}/stage`, data),

  archive: (id: number) =>
    api.patch(`/Applications/${id}/archive`),

  getStats: () =>
    api.get('/Applications/stats'),

  getHistory: (id: number) =>
    api.get(`/Applications/${id}/history`),
}

// ── Suggestions ───────────────────────────────────────────────
// POST /api/Suggestions/sync
// GET  /api/Suggestions/pending
// POST /api/Suggestions/{id}/approve
// POST /api/Suggestions/{id}/reject

export const suggestionsApi = {
  sync:       ()           => api.post('/Suggestions/sync'),
  getPending: ()           => api.get('/Suggestions/pending'),
  approve:    (id: number) => api.post(`/Suggestions/${id}/approve`),
  reject:     (id: number) => api.post(`/Suggestions/${id}/reject`),
}

// ── Integrations ──────────────────────────────────────────────
// GET    /api/Integrations/google/auth-url
// DELETE /api/Integrations/google/disconnect

export const integrationsApi = {
  getGoogleAuthUrl: () => api.get('/Integrations/google/auth-url'),
  disconnect:       () => api.delete('/Integrations/google/disconnect'),
}

// ── Users ─────────────────────────────────────────────────────
// PUT /api/Users/profile
// PUT /api/Users/password

export const usersApi = {
  updateProfile:  (data: { fullName: string }) =>
    api.put('/Users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/Users/password', data),
}