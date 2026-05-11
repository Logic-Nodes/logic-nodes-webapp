import { create } from 'zustand'
import type { Trip, CreateTripDto, OriginPoint } from '../types'
import { tripsApi, originPointsApi } from '../api/trips.api'
import toast from 'react-hot-toast'

interface TripsState {
  trips: Trip[]
  trip: Trip | null
  loading: boolean
  originPoints: OriginPoint[]

  loadTrips: () => Promise<void>
  loadTripById: (id: number | string) => Promise<void>
  createTrip: (dto: CreateTripDto) => Promise<void>
  startTrip: (id: number) => Promise<void>
  loadOriginPoints: () => Promise<void>
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [], trip: null, loading: false, originPoints: [],

  loadTrips: async () => {
    set({ loading: true })
    try { set({ trips: await tripsApi.getAll() }) }
    catch { toast.error('Error loading trips') }
    finally { set({ loading: false }) }
  },

  loadTripById: async (id) => {
    set({ loading: true })
    try { set({ trip: await tripsApi.getById(id) }) }
    catch { toast.error('Error loading trip') }
    finally { set({ loading: false }) }
  },

  createTrip: async (dto) => {
    await tripsApi.create(dto)
    toast.success('Trip created successfully')
    get().loadTrips()
  },

  startTrip: async (id) => {
    const trip = await tripsApi.start(id)
    toast.success('Trip started successfully')
    set({ trip })
    get().loadTrips()
  },

  loadOriginPoints: async () => {
    try { set({ originPoints: await originPointsApi.getAll() }) }
    catch { toast.error('Error loading origin points') }
  },
}))
