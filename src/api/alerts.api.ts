import { apiClient } from './client'
import type { Alert } from '../types'

export const alertsApi = {
  getAll: () => apiClient.get<Alert[]>('/alerts').then(r => r.data),
  acknowledge: (id: number) => apiClient.patch<Alert>(`/alerts/${id}/acknowledgment`, {}).then(r => r.data),
  close: (id: number) => apiClient.patch<Alert>(`/alerts/${id}/closure`, {}).then(r => r.data),
}
