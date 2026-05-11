import { apiClient } from './client'
import type { Device, CreateDeviceDto } from '../types'

export const devicesApi = {
  getAll: () => apiClient.get<Device[]>('/fleet/devices').then(r => r.data),
  getById: (id: number) => apiClient.get<Device>(`/fleet/devices/${id}`).then(r => r.data),
  create: (dto: CreateDeviceDto) => apiClient.post<Device>('/fleet/devices', dto).then(r => r.data),
  update: (id: number, dto: CreateDeviceDto) => apiClient.put<Device>(`/fleet/devices/${id}`, dto).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/fleet/devices/${id}`),
  updateFirmware: (id: number, firmware: string) =>
    apiClient.post<Device>(`/fleet/devices/${id}/firmware`, null, { params: { firmware } }).then(r => r.data),
  updateOnline: (id: number, online: boolean) =>
    apiClient.patch<Device>(`/fleet/devices/${id}/online`, { online }).then(r => r.data),
  findByOnline: (online: boolean) =>
    apiClient.get<Device[]>(`/fleet/devices/by-online/${online}`).then(r => r.data),
  findByImei: (imei: string) =>
    apiClient.get<Device>(`/fleet/devices/by-imei/${encodeURIComponent(imei)}`).then(r => r.data),
}
