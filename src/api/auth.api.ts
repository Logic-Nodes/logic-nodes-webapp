import { apiClient } from './client'
import type { SignInResponse } from '../types'

export const authApi = {
  signIn: (email: string, password: string) =>
    apiClient.post<SignInResponse>('/authentication/sign-in', { email, password }).then(r => r.data),

  signUp: (email: string, password: string, profile: { firstName: string; lastName: string }, roles: string[]) =>
    apiClient.post('/authentication/sign-up', { email, password, profile, roles }),

  logout: () => apiClient.post('/authentication/logout'),
}
