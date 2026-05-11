import { apiClient } from './client'
import type { Profile, UpdateProfileDto } from '../types'

export const profileApi = {
  getByUserId: (userId: number) =>
    apiClient.get<Profile>(`/profiles/user/${userId}`).then(r => r.data),
  update: (id: number, dto: UpdateProfileDto) =>
    apiClient.put<Profile>(`/profiles/${id}`, dto).then(r => r.data),
}
