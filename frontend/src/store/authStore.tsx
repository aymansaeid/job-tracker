import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user:            User | null
  token:           string | null
  isAuthenticated: boolean
  setAuth:         (user: User, token: string) => void
  setUser:         (user: Partial<User>) => void
  logout:          () => void
  setGmailDisconnected: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      // Was a full replace — `setUser(res.data as User)` from a profile
      // fetch would silently wipe any field the backend response doesn't
      // include. Merging means a partial response can never erase data
      // the rest of the app is still relying on.
      setUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : (patch as User),
        })),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      setGmailDisconnected: () =>
        set((state) => ({
          user: state.user ? { ...state.user, googleRefreshToken: undefined } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) state.isAuthenticated = true
      },
    },
  ),
)