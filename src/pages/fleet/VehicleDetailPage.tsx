import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Cpu, Gauge, Wrench, Tag, Calendar, Weight, User } from 'lucide-react'
import { useFleetStore } from '@/store/fleet.store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const STATUS_BADGE: Record<string, 'success' | 'error' | 'warning' | 'gray'> = {
  IN_SERVICE: 'success',
  OUT_OF_SERVICE: 'error',
  MAINTENANCE: 'warning',
  RETIRED: 'gray',
}

const STATUS_LABEL: Record<string, string> = {
  IN_SERVICE: 'In Service',
  OUT_OF_SERVICE: 'Out of Service',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retired',
}

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { vehicle, vehiclesLoading, loadVehicleById, updateVehicleStatus, assignDevice, unassignDevice } = useFleetStore()

  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [unassignOpen, setUnassignOpen] = useState(false)
  const [unassignAllLoading, setUnassignAllLoading] = useState(false)

  const { register: regAssign, handleSubmit: handleAssign, reset: resetAssign, formState: { errors: errAssign } } = useForm<{ imei: string }>()
  const { register: regUnassign, handleSubmit: handleUnassign, reset: resetUnassign, watch: watchUnassign } = useForm<{ imei: string }>()

  useEffect(() => {
    if (id) loadVehicleById(Number(id))
  }, [id, loadVehicleById])

  const handleSetStatus = async (status: string) => {
    if (!vehicle) return
    setStatusLoading(status)
    try { await updateVehicleStatus(vehicle.id, status) }
    finally {
      setStatusLoading(null)
      if (id) loadVehicleById(Number(id))
    }
  }

  const onAssignSubmit = async (data: { imei: string }) => {
    if (!vehicle) return
    await assignDevice(vehicle.id, data.imei)
    resetAssign()
    setAssignOpen(false)
    if (id) loadVehicleById(Number(id))
  }

  const onUnassignSubmit = async (data: { imei: string }) => {
    if (!vehicle) return
    await unassignDevice(vehicle.id, data.imei)
    resetUnassign()
    setUnassignOpen(false)
    if (id) loadVehicleById(Number(id))
  }

  const handleUnassignAll = async () => {
    if (!vehicle) return
    setUnassignAllLoading(true)
    try {
      for (const imei of vehicle.deviceImeis ?? []) {
        await unassignDevice(vehicle.id, imei)
      }
      if (id) loadVehicleById(Number(id))
    } finally {
      setUnassignAllLoading(false)
    }
  }

  const deviceImeis = vehicle?.deviceImeis ?? []

  if (vehiclesLoading && !vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading vehicle...
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="p-6">
        <p className="text-slate-400">Vehicle not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/fleet/vehicles')}>
          <ArrowLeft size={16} /> Back to Vehicles
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Vehicle {vehicle.plate}</h1>
          <Badge variant={STATUS_BADGE[vehicle.status] ?? 'gray'}>
            {STATUS_LABEL[vehicle.status] ?? vehicle.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-white">Technical Details</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                  <Tag size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Type</p>
                  <p className="text-white font-medium mt-0.5">{vehicle.type}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                  <Cpu size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">IoT Devices</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {deviceImeis.length ? (
                      deviceImeis.map(imei => (
                        <span
                          key={imei}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300 font-mono text-xs border border-brand-500/20"
                        >
                          {imei}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">No devices assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                  <Wrench size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Capabilities</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(vehicle.capabilities ?? []).length ? (
                      (vehicle.capabilities ?? []).map(cap => (
                        <span
                          key={cap}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-xs font-medium"
                        >
                          {cap.charAt(0) + cap.slice(1).toLowerCase()}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">None</span>
                    )}
                  </div>
                </div>
              </div>

              {(vehicle.brand || vehicle.model) && (
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                    <Tag size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Marca / Modelo</p>
                    <p className="text-white font-medium mt-0.5">
                      {[vehicle.brand, vehicle.model].filter(Boolean).join(' ')}
                    </p>
                  </div>
                </div>
              )}

              {vehicle.year && (
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                    <Calendar size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Año</p>
                    <p className="text-white font-medium mt-0.5">{vehicle.year}</p>
                  </div>
                </div>
              )}

              {vehicle.cargoCapacityKg != null && (
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                    <Weight size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Capacidad de carga</p>
                    <p className="text-white font-medium mt-0.5">{vehicle.cargoCapacityKg.toLocaleString()} kg</p>
                  </div>
                </div>
              )}

              {vehicle.driverName && (
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                    <User size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Conductor asignado</p>
                    <p className="text-white font-medium mt-0.5">{vehicle.driverName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                  <Gauge size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Odómetro</p>
                  <p className="text-white font-medium mt-0.5">
                    {vehicle.odometerKm != null ? `${vehicle.odometerKm.toLocaleString()} km` : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-white">Quick Actions</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                loading={statusLoading === 'IN_SERVICE'}
                disabled={vehicle.status === 'IN_SERVICE'}
                onClick={() => handleSetStatus('IN_SERVICE')}
              >
                Set In Service
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                loading={statusLoading === 'OUT_OF_SERVICE'}
                disabled={vehicle.status === 'OUT_OF_SERVICE'}
                onClick={() => handleSetStatus('OUT_OF_SERVICE')}
              >
                Set Out of Service
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                loading={statusLoading === 'MAINTENANCE'}
                disabled={vehicle.status === 'MAINTENANCE'}
                onClick={() => handleSetStatus('MAINTENANCE')}
              >
                Set In Maintenance
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                loading={statusLoading === 'RETIRED'}
                disabled={vehicle.status === 'RETIRED'}
                onClick={() => handleSetStatus('RETIRED')}
              >
                Set As Retired
              </Button>

              <div className="border-t border-white/10 my-1" />

              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setAssignOpen(true)}
              >
                Assign IoT Device
              </Button>

              {deviceImeis.length > 0 && (
                <>
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => setUnassignOpen(true)}
                  >
                    Unassign Device
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    loading={unassignAllLoading}
                    onClick={handleUnassignAll}
                  >
                    Unassign All
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <Button variant="ghost" onClick={() => navigate('/fleet/vehicles')}>
          <ArrowLeft size={16} /> Back to Vehicles
        </Button>
      </div>

      <Modal open={assignOpen} onClose={() => { setAssignOpen(false); resetAssign() }} title="Assign IoT Device" size="sm">
        <form onSubmit={handleAssign(onAssignSubmit)} className="flex flex-col gap-4">
          <Input
            label="Device IMEI"
            id="assign-imei"
            placeholder="Enter IMEI..."
            error={errAssign.imei?.message}
            {...regAssign('imei', { required: 'IMEI is required' })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => { setAssignOpen(false); resetAssign() }}>Cancel</Button>
            <Button type="submit">Assign</Button>
          </div>
        </form>
      </Modal>

      <Modal open={unassignOpen} onClose={() => { setUnassignOpen(false); resetUnassign() }} title="Unassign Device" size="sm">
        <form onSubmit={handleUnassign(onUnassignSubmit)} className="flex flex-col gap-4">
          <Select
            label="Select IMEI to unassign"
            id="unassign-imei"
            options={deviceImeis.map(imei => ({ value: imei, label: imei }))}
            placeholder="Choose a device..."
            {...regUnassign('imei', { required: 'Please select a device' })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => { setUnassignOpen(false); resetUnassign() }}>Cancel</Button>
            <Button type="submit" variant="danger">Unassign</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
