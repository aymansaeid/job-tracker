import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user:            User | null
  token:           string | null
  isAuthenticated: boolean
  isGmailConnected: boolean 
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
      isGmailConnected: false,

      setAuth: (user, token) =>
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isGmailConnected: !!user.googleRefreshToken || !!(user as any).isGmailConnected 
        }),

      setUser: (patch) =>
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...patch } : (patch as User);
          return {
            user: updatedUser,
            isGmailConnected: !!updatedUser.googleRefreshToken || !!(updatedUser as any).isGmailConnected || state.isGmailConnected
          };
        }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, isGmailConnected: false }),

      setGmailDisconnected: () =>
        set((state) => ({
          user: state.user ? { ...state.user, googleRefreshToken: undefined } : null,
          isGmailConnected: false
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isGmailConnected: state.isGmailConnected 
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) state.isAuthenticated = true
      },
    },
  ),
)