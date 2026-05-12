import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import type { User } from '../types'
import { authApi } from '../api/auth.api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, profile: { firstName: string; lastName: string }, roles: string[]) => Promise<void>
  logout: () => Promise<void>
  loadUserFromToken: () => void
  isAdmin: () => boolean
  isOperator: () => boolean
  isDriver: () => boolean
  isCustomer: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  loadUserFromToken: () => {
    const token = localStorage.getItem('access_token')
    if (!token) { set({ user: null, isAuthenticated: false }); return }
    try {
      const payload = jwtDecode<{ uid: string; email: string; roles: string[] }>(token)
      const user: User = { id: parseInt(payload.uid), email: payload.email, roles: payload.roles || [] }
      set({ user, isAuthenticated: true })
    } catch {
      set({ user: null, isAuthenticated: false })
    }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { accessToken, refreshToken } = await authApi.signIn(email, password)
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      get().loadUserFromToken()
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email, password, profile, roles) => {
    await authApi.signUp(email, password, profile, roles)
  },

  logout: async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false })
  },

  isAdmin: () => get().user?.roles.includes('ADMIN') ?? false,
  isOperator: () => get().user?.roles.includes('OPERATOR') ?? false,
  isDriver: () => get().user?.roles.includes('DRIVER') ?? false,
  isCustomer: () => get().user?.roles.includes('CUSTOMER') ?? false,
}))
