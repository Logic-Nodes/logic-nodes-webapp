import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { Plus, Search, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { useFleetStore } from '@/store/fleet.store'
import type { Vehicle, CreateVehicleDto } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { SlideOver } from '@/components/ui/SlideOver'
import { Table } from '@/components/ui/Table'

const STATUS_PILLS = [
  { value: '', label: 'All' },
  { value: 'IN_SERVICE', label: 'In Service' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
  { value: 'RETIRED', label: 'Retired' },
]

const CAPABILITY_FILTER_OPTIONS = [
  { value: '', label: 'All capabilities' },
  { value: 'TEMPERATURE', label: 'Temperature' },
  { value: 'HUMIDITY', label: 'Humidity' },
  { value: 'VIBRATION', label: 'Vibration' },
  { value: 'GPS', label: 'GPS' },
]

const TYPE_OPTIONS = [
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'CAR', label: 'Car' },
]

const CAPABILITIES_LIST = ['TEMPERATURE', 'HUMIDITY', 'VIBRATION', 'GPS']

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

interface VehicleFormData {
  plate: string
  type: string
  brand: string
  model: string
  year: number
  cargoCapacityKg: number
  driverName: string
  odometerKm: number
  capabilities: string[]
}

function ActionsMenu({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen(o => !o)
  }

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          ref={menuRef}
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-50 w-36 bg-[#1E293B] rounded-xl shadow-xl border border-white/10 py-1"
        >
          <button onClick={() => { onView(); setOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
            <Eye size={14} /> Ver
          </button>
          <button onClick={() => { onEdit(); setOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
            <Pencil size={14} /> Editar
          </button>
          <button onClick={() => { onDelete(); setOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

function StatusBar({ kpis }: { kpis: { IN_SERVICE: number; OUT_OF_SERVICE: number; MAINTENANCE: number; RETIRED: number } }) {
  const total = kpis.IN_SERVICE + kpis.OUT_OF_SERVICE + kpis.MAINTENANCE + kpis.RETIRED
  if (total === 0) return null
  return (
    <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-300">{total} vehículos en total</p>
      </div>
      <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
        {kpis.IN_SERVICE > 0 && <div className="bg-emerald-500" style={{ flex: kpis.IN_SERVICE }} />}
        {kpis.MAINTENANCE > 0 && <div className="bg-amber-400" style={{ flex: kpis.MAINTENANCE }} />}
        {kpis.OUT_OF_SERVICE > 0 && <div className="bg-red-400" style={{ flex: kpis.OUT_OF_SERVICE }} />}
        {kpis.RETIRED > 0 && <div className="bg-slate-300" style={{ flex: kpis.RETIRED }} />}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />En servicio ({kpis.IN_SERVICE})
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-amber-400" />Mantenimiento ({kpis.MAINTENANCE})
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-red-400" />Fuera de servicio ({kpis.OUT_OF_SERVICE})
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-slate-300" />Retirado ({kpis.RETIRED})
        </span>
      </div>
    </div>
  )
}

function VehicleSlideOver({ open, onClose, vehicle }: { open: boolean; onClose: () => void; vehicle: Vehicle | null }) {
  const { createVehicle, updateVehicle } = useFleetStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<VehicleFormData>({
    defaultValues: { plate: '', type: 'TRUCK', brand: '', model: '', year: new Date().getFullYear(), cargoCapacityKg: 0, driverName: '', odometerKm: 0, capabilities: [] },
  })

  useEffect(() => {
    if (open) {
      reset(
        vehicle
          ? {
              plate: vehicle.plate, type: vehicle.type,
              brand: vehicle.brand ?? '', model: vehicle.model ?? '',
              year: vehicle.year ?? new Date().getFullYear(),
              cargoCapacityKg: vehicle.cargoCapacityKg ?? 0,
              driverName: vehicle.driverName ?? '',
              odometerKm: vehicle.odometerKm ?? 0, capabilities: vehicle.capabilities ?? [],
            }
          : { plate: '', type: 'TRUCK', brand: '', model: '', year: new Date().getFullYear(), cargoCapacityKg: 0, driverName: '', odometerKm: 0, capabilities: [] }
      )
    }
  }, [open, vehicle, reset])

  const onSubmit = async (data: VehicleFormData) => {
    setLoading(true)
    try {
      const dto: CreateVehicleDto = {
        plate: data.plate,
        type: data.type,
        brand: data.brand || null,
        model: data.model || null,
        year: Number(data.year) || null,
        cargoCapacityKg: Number(data.cargoCapacityKg) || null,
        driverName: data.driverName || null,
        capabilities: data.capabilities,
        status: vehicle?.status ?? 'IN_SERVICE',
        odometerKm: Number(data.odometerKm),
        deviceImeis: vehicle?.deviceImeis ?? [],
      }
      if (vehicle) {
        await updateVehicle(vehicle.id, dto)
      } else {
        await createVehicle(dto)
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={vehicle ? 'Editar Vehículo' : 'Registrar Vehículo'}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="vehicle-form" loading={loading}>
            {vehicle ? 'Guardar Cambios' : 'Guardar Vehículo'}
          </Button>
        </div>
      }
    >
      <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Placa"
          id="plate"
          placeholder="ej. ABC-123"
          error={errors.plate?.message}
          {...register('plate', { required: 'La placa es requerida' })}
        />
        <Controller
          name="type"
          control={control}
          rules={{ required: 'El tipo es requerido' }}
          render={({ field }) => (
            <Select label="Tipo de vehículo" id="type" options={TYPE_OPTIONS} error={errors.type?.message} {...field} />
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Marca"
            id="brand"
            placeholder="ej. Mercedes"
            {...register('brand')}
          />
          <Input
            label="Modelo"
            id="model"
            placeholder="ej. Atego 1726"
            {...register('model')}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Año"
            id="year"
            type="number"
            min={1990}
            max={new Date().getFullYear() + 1}
            {...register('year', { valueAsNumber: true })}
          />
          <Input
            label="Capacidad de carga (kg)"
            id="cargoCapacityKg"
            type="number"
            min={0}
            {...register('cargoCapacityKg', { valueAsNumber: true })}
          />
        </div>
        <Input
          label="Conductor asignado"
          id="driverName"
          placeholder="ej. Juan Pérez"
          {...register('driverName')}
        />
        <Input
          label="Odómetro (km)"
          id="odometerKm"
          type="number"
          min={0}
          {...register('odometerKm', { valueAsNumber: true })}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">Capabilities</span>
          <Controller
            name="capabilities"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {CAPABILITIES_LIST.map(cap => (
                  <label key={cap} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-white/20 text-brand-500 focus:ring-brand-500 bg-white/5"
                      checked={(field.value ?? []).includes(cap)}
                      onChange={e => {
                        const current = field.value ?? []
                        field.onChange(
                          e.target.checked ? [...current, cap] : current.filter((c: string) => c !== cap)
                        )
                      }}
                    />
                    {cap.charAt(0) + cap.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
            )}
          />
        </div>
      </form>
    </SlideOver>
  )
}

export function VehiclesPage() {
  const navigate = useNavigate()
  const { vehicles, vehiclesLoading, loadVehicles, deleteVehicle } = useFleetStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [capabilityFilter, setCapabilityFilter] = useState('')
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadVehicles() }, [loadVehicles])

  const kpis = useMemo(() => ({
    IN_SERVICE: vehicles.filter(v => v.status === 'IN_SERVICE').length,
    OUT_OF_SERVICE: vehicles.filter(v => v.status === 'OUT_OF_SERVICE').length,
    MAINTENANCE: vehicles.filter(v => v.status === 'MAINTENANCE').length,
    RETIRED: vehicles.filter(v => v.status === 'RETIRED').length,
  }), [vehicles])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return vehicles.filter(v => {
      const matchSearch = !q || v.plate.toLowerCase().includes(q) || v.type.toLowerCase().includes(q)
      const matchStatus = !statusFilter || v.status === statusFilter
      const matchCap = !capabilityFilter || (v.capabilities ?? []).includes(capabilityFilter)
      return matchSearch && matchStatus && matchCap
    })
  }, [vehicles, search, statusFilter, capabilityFilter])

  const handleDelete = async () => {
    if (deleteId == null) return
    setDeleting(true)
    try { await deleteVehicle(deleteId) }
    finally { setDeleting(false); setDeleteId(null) }
  }

  const columns = [
    { key: 'id', header: 'ID', render: (v: Vehicle) => <span className="text-slate-400 text-xs">#{v.id}</span> },
    { key: 'plate', header: 'Plate', render: (v: Vehicle) => <span className="font-semibold text-white">{v.plate}</span> },
    { key: 'type', header: 'Type', render: (v: Vehicle) => <span className="text-slate-300">{v.type}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (v: Vehicle) => (
        <Badge variant={STATUS_BADGE[v.status] ?? 'gray'} dot>{STATUS_LABEL[v.status] ?? v.status}</Badge>
      ),
    },
    {
      key: 'capabilities',
      header: 'Capabilities',
      render: (v: Vehicle) => (
        <span className="text-xs text-slate-500">
          {(v.capabilities ?? []).length ? (v.capabilities ?? []).join(', ') : '—'}
        </span>
      ),
    },
    {
      key: 'iot',
      header: 'IoT',
      render: (v: Vehicle) => {
        const imei = (v.deviceImeis ?? [])[0]
        if (!imei) return <span className="text-slate-400">—</span>
        const display = imei.length > 12 ? imei.slice(0, 12) + '...' : imei
        return (
          <span className="border border-white/10 text-xs font-mono text-slate-400 px-2 py-0.5 rounded">
            {display}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (v: Vehicle) => (
        <div onClick={e => e.stopPropagation()}>
          <ActionsMenu
            onView={() => navigate(`/fleet/vehicles/${v.id}`)}
            onEdit={() => { setEditVehicle(v); setSlideOverOpen(true) }}
            onDelete={() => setDeleteId(v.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vehicles</h1>
          <p className="text-sm text-slate-400 mt-0.5">Administra los vehículos de tu flota</p>
        </div>
        <Button onClick={() => { setEditVehicle(null); setSlideOverOpen(true) }}>
          <Plus size={16} /> Registrar Vehículo
        </Button>
      </div>

      <StatusBar kpis={kpis} />

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by plate or type..."
              leftIcon={<Search size={16} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="w-52">
            <Select
              options={CAPABILITY_FILTER_OPTIONS}
              value={capabilityFilter}
              onChange={e => setCapabilityFilter(e.target.value)}
              placeholder=""
            />
          </div>
        </div>
        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          {STATUS_PILLS.map(pill => (
            <button
              key={pill.value}
              onClick={() => setStatusFilter(pill.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                statusFilter === pill.value
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Table
          columns={columns as never}
          data={filtered as never[]}
          loading={vehiclesLoading}
          emptyMessage="No vehicles found"
          onRowClick={v => navigate(`/fleet/vehicles/${(v as Vehicle).id}`)}
        />
      </div>

      <VehicleSlideOver
        open={slideOverOpen}
        onClose={() => { setSlideOverOpen(false); setEditVehicle(null) }}
        vehicle={editVehicle}
      />

      <Modal open={deleteId != null} onClose={() => setDeleteId(null)} title="Delete Vehicle" size="sm">
        <p className="text-sm text-slate-400 mb-6">
          Are you sure you want to delete this vehicle? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
