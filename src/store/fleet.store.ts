import { create } from 'zustand'
import type { Vehicle, Device, CreateVehicleDto, CreateDeviceDto } from '../types'
import { vehiclesApi } from '../api/vehicles.api'
import { devicesApi } from '../api/devices.api'
import toast from 'react-hot-toast'

interface FleetState {
  vehicles: Vehicle[]
  vehicle: Vehicle | null
  vehiclesLoading: boolean
  devices: Device[]
  device: Device | null
  devicesLoading: boolean

  loadVehicles: () => Promise<void>
  loadVehicleById: (id: number) => Promise<void>
  createVehicle: (dto: CreateVehicleDto) => Promise<void>
  updateVehicle: (id: number, dto: CreateVehicleDto) => Promise<void>
  deleteVehicle: (id: number) => Promise<void>
  assignDevice: (vehicleId: number, imei: string) => Promise<void>
  unassignDevice: (vehicleId: number, imei: string) => Promise<void>
  updateVehicleStatus: (id: number, status: string) => Promise<void>

  loadDevices: () => Promise<void>
  loadDeviceById: (id: number) => Promise<void>
  createDevice: (dto: CreateDeviceDto) => Promise<void>
  updateDevice: (id: number, dto: CreateDeviceDto) => Promise<void>
  deleteDevice: (id: number) => Promise<void>
  updateFirmware: (id: number, firmware: string) => Promise<void>
  updateOnline: (id: number, online: boolean) => Promise<void>
}

export const useFleetStore = create<FleetState>((set, get) => ({
  vehicles: [], vehicle: null, vehiclesLoading: false,
  devices: [], device: null, devicesLoading: false,

  loadVehicles: async () => {
    set({ vehiclesLoading: true })
    try { set({ vehicles: await vehiclesApi.getAll() }) }
    catch { toast.error('Error loading vehicles') }
    finally { set({ vehiclesLoading: false }) }
  },

  loadVehicleById: async (id) => {
    set({ vehiclesLoading: true })
    try { set({ vehicle: await vehiclesApi.getById(id) }) }
    catch { toast.error('Error loading vehicle') }
    finally { set({ vehiclesLoading: false }) }
  },

  createVehicle: async (dto) => {
    await vehiclesApi.create(dto)
    toast.success('Vehicle created successfully')
    get().loadVehicles()
  },

  updateVehicle: async (id, dto) => {
    await vehiclesApi.update(id, dto)
    toast.success('Vehicle updated successfully')
    get().loadVehicles()
  },

  deleteVehicle: async (id) => {
    await vehiclesApi.delete(id)
    toast.success('Vehicle deleted successfully')
    get().loadVehicles()
  },

  assignDevice: async (vehicleId, imei) => {
    await vehiclesApi.assignDevice(vehicleId, imei)
    toast.success('Device assigned successfully')
    get().loadVehicles()
  },

  unassignDevice: async (vehicleId, imei) => {
    await vehiclesApi.unassignDevice(vehicleId, imei)
    toast.success('Device unassigned successfully')
    get().loadVehicles()
  },

  updateVehicleStatus: async (id, status) => {
    await vehiclesApi.updateStatus(id, status)
    toast.success('Vehicle status updated')
    get().loadVehicles()
  },

  loadDevices: async () => {
    set({ devicesLoading: true })
    try { set({ devices: await devicesApi.getAll() }) }
    catch { toast.error('Error loading devices') }
    finally { set({ devicesLoading: false }) }
  },

  loadDeviceById: async (id) => {
    set({ devicesLoading: true })
    try { set({ device: await devicesApi.getById(id) }) }
    catch { toast.error('Error loading device') }
    finally { set({ devicesLoading: false }) }
  },

  createDevice: async (dto) => {
    await devicesApi.create(dto)
    toast.success('Device created successfully')
    get().loadDevices()
  },

  updateDevice: async (id, dto) => {
    await devicesApi.update(id, dto)
    toast.success('Device updated successfully')
    get().loadDevices()
  },

  deleteDevice: async (id) => {
    await devicesApi.delete(id)
    toast.success('Device deleted successfully')
    get().loadDevices()
  },

  updateFirmware: async (id, firmware) => {
    await devicesApi.updateFirmware(id, firmware)
    toast.success('Firmware updated successfully')
    get().loadDevices()
  },

  updateOnline: async (id, online) => {
    await devicesApi.updateOnline(id, online)
    toast.success(`Device is now ${online ? 'online' : 'offline'}`)
    get().loadDevices()
  },
}))
