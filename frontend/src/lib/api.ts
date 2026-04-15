import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:7266/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT to every request automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const raw = localStorage.getItem('auth-storage')
  if (raw) {
    try {
      const { state } = JSON.parse(raw) as { state: { token?: string } }
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    } catch {
      // malformed storage — ignore
    }
  }
  return config
})

// If the server returns 401, clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ── Auth ─────────────────────────────────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/Auth/login', data),
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post('/Auth/register', data),
}

// ── Applications ──────────────────────────────────────────────

export const applicationsApi = {
  getAll: () =>
    api.get('/applications'),
  create: (data: unknown) =>
    api.post('/applications', data),
  getStats: () =>
    api.get('/applications/stats'),
  getHistory: (id: number) =>
    api.get(`/applications/${id}/history`),
  updateStage: (id: number, newStage: number) =>
    api.patch(`/applications/${id}/stage`, { newStage }),
}

// ── AI Suggestions ────────────────────────────────────────────

export const suggestionsApi = {
  sync:       ()           => api.post('/suggestions/sync'),
  getPending: ()           => api.get('/suggestions/pending'),
  approve:    (id: number) => api.post(`/suggestions/${id}/approve`),
  reject:     (id: number) => api.post(`/suggestions/${id}/reject`),
}

// ── Integrations ──────────────────────────────────────────────

export const integrationsApi = {
  getGoogleAuthUrl: () => api.get('/integrations/google/auth-url'),
}