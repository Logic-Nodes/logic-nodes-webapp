import { apiClient } from './client'
import type { Vehicle, CreateVehicleDto } from '../types'

export const vehiclesApi = {
  getAll: () => apiClient.get<Vehicle[]>('/fleet/vehicles').then(r => r.data),
  getById: (id: number) => apiClient.get<Vehicle>(`/fleet/vehicles/${id}`).then(r => r.data),
  create: (dto: CreateVehicleDto) => apiClient.post<Vehicle>('/fleet/vehicles', dto).then(r => r.data),
  update: (id: number, dto: CreateVehicleDto) => apiClient.put<Vehicle>(`/fleet/vehicles/${id}`, dto).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/fleet/vehicles/${id}`),
  assignDevice: (vehicleId: number, imei: string) =>
    apiClient.post<Vehicle>(`/fleet/vehicles/${vehicleId}/assign-device/${encodeURIComponent(imei)}`, {}).then(r => r.data),
  unassignDevice: (vehicleId: number, imei: string) =>
    apiClient.post(`/fleet/vehicles/${vehicleId}/unassign-device/${encodeURIComponent(imei)}`, {}),
  updateStatus: (id: number, status: string) =>
    apiClient.patch<Vehicle>(`/fleet/vehicles/${id}/status`, { status }).then(r => r.data),
  findByPlate: (plate: string) =>
    apiClient.get<Vehicle>(`/fleet/vehicles/by-plate/${encodeURIComponent(plate)}`).then(r => r.data),
}
