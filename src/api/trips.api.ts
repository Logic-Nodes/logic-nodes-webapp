import { apiClient } from './client'
import type { Trip, CreateTripDto, DeliveryOrder, OriginPoint } from '../types'

export const tripsApi = {
  getAll: () => apiClient.get<Trip[]>('/trips').then(r => r.data),
  getById: (id: number | string) => apiClient.get<Trip>(`/trips/${id}`).then(r => r.data),
  create: (dto: CreateTripDto) => apiClient.post<Trip>('/trips', dto).then(r => r.data),
  start: (id: number) => apiClient.post<Trip>(`/trips/${id}/start`, {}).then(r => r.data),
}

export const deliveryOrdersApi = {
  getAll: () => apiClient.get<DeliveryOrder[]>('/delivery-orders').then(r => r.data),
  markDelivered: (id: number) => apiClient.post(`/delivery-orders/${id}/delivery`).then(r => r.data),
}

export const originPointsApi = {
  getAll: () => apiClient.get<OriginPoint[]>('/origin-points').then(r => r.data),
}
