import { create } from 'zustand'
import type { Alert } from '../types'
import { alertsApi } from '../api/alerts.api'
import toast from 'react-hot-toast'

interface AlertsState {
  alerts: Alert[]
  loading: boolean
  loadAlerts: () => Promise<void>
  acknowledgeAlert: (id: number) => Promise<void>
  closeAlert: (id: number) => Promise<void>
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [], loading: false,

  loadAlerts: async () => {
    set({ loading: true })
    try { set({ alerts: await alertsApi.getAll() }) }
    catch { toast.error('Error loading alerts') }
    finally { set({ loading: false }) }
  },

  acknowledgeAlert: async (id) => {
    const updated = await alertsApi.acknowledge(id)
    set({ alerts: get().alerts.map(a => a.id === id ? updated : a) })
    toast.success('Alert acknowledged')
  },

  closeAlert: async (id) => {
    const updated = await alertsApi.close(id)
    set({ alerts: get().alerts.map(a => a.id === id ? updated : a) })
    toast.success('Alert closed')
  },
}))
