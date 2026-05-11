import { apiClient } from './client'
import type { DashboardTrip, DashboardAlert, IncidentsByMonth } from '../types'

export const dashboardApi = {
  getTrips: () => apiClient.get<DashboardTrip[]>('/analytics/trips').then(r => r.data),
  getTripById: (id: string) => apiClient.get<DashboardTrip>(`/analytics/trips/${id}`).then(r => r.data),
  getAlerts: () => apiClient.get<DashboardAlert[]>('/analytics/alerts').then(r => r.data),
  getAlertsByTripId: (tripId: string) =>
    apiClient.get<DashboardAlert[]>(`/analytics/alerts?tripId=${tripId}`).then(r => r.data),
  getIncidentsByMonth: () => apiClient.get<IncidentsByMonth[]>('/analytics/incidents-by-month').then(r => r.data),
}
