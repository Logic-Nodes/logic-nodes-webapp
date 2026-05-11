import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, Search, Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { useFleetStore } from '@/store/fleet.store'
import type { Device, CreateDeviceDto } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { SlideOver } from '@/components/ui/SlideOver'
import { Table } from '@/components/ui/Table'

interface DeviceFormData {
  imei: string
  firmware: string
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

function DeviceSlideOver({ open, onClose, device }: { open: boolean; onClose: () => void; device: Device | null }) {
  const { createDevice, updateDevice } = useFleetStore()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeviceFormData>({
    defaultValues: { imei: '', firmware: '' },
  })

  useEffect(() => {
    if (open) {
      reset(device ? { imei: device.imei, firmware: device.firmware } : { imei: '', firmware: '' })
    }
  }, [open, device, reset])

  const onSubmit = async (data: DeviceFormData) => {
    setLoading(true)
    try {
      const dto: CreateDeviceDto = {
        imei: data.imei,
        firmware: data.firmware,
        online: device?.online ?? false,
        vehiclePlate: device?.vehiclePlate ?? null,
      }
      if (device) {
        await updateDevice(device.id, dto)
      } else {
        await createDevice(dto)
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
      title={device ? 'Editar Dispositivo' : 'Registrar Dispositivo'}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="device-form" loading={loading}>
            {device ? 'Guardar Cambios' : 'Guardar Dispositivo'}
          </Button>
        </div>
      }
    >
      <form id="device-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="IMEI"
          id="imei"
          placeholder="e.g. 123456789012345"
          error={errors.imei?.message}
          {...register('imei', { required: 'IMEI is required' })}
        />
        <Input
          label="Firmware"
          id="firmware"
          placeholder="e.g. v1.0.0"
          error={errors.firmware?.message}
          {...register('firmware', { required: 'Firmware is required' })}
        />
      </form>
    </SlideOver>
  )
}

export function DevicesPage() {
  const navigate = useNavigate()
  const { devices, devicesLoading, loadDevices, deleteDevice } = useFleetStore()

  const [search, setSearch] = useState('')
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editDevice, setEditDevice] = useState<Device | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadDevices() }, [loadDevices])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return devices.filter(d => !q || d.imei.toLowerCase().includes(q))
  }, [devices, search])

  const onlineCount = devices.filter(d => d.online).length
  const offlineCount = devices.filter(d => !d.online).length

  const handleDelete = async () => {
    if (deleteId == null) return
    setDeleting(true)
    try { await deleteDevice(deleteId) }
    finally { setDeleting(false); setDeleteId(null) }
  }

  const columns = [
    { key: 'id', header: 'ID', render: (d: Device) => <span className="text-slate-400 text-xs">#{d.id}</span> },
    {
      key: 'imei',
      header: 'IMEI',
      render: (d: Device) => <span className="font-mono text-xs text-slate-200">{d.imei}</span>,
    },
    {
      key: 'firmware',
      header: 'Firmware',
      render: (d: Device) => {
        const ver = parseFloat(d.firmware.replace('v', ''))
        return (
          <div className="flex items-center gap-2">
            <span className="text-slate-300">{d.firmware}</span>
            {!isNaN(ver) && ver < 2.0 && (
              <Badge variant="warning">Actualizar</Badge>
            )}
          </div>
        )
      },
    },
    {
      key: 'online',
      header: 'Online',
      render: (d: Device) => (
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${d.online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <span className={`text-sm ${d.online ? 'text-emerald-400' : 'text-slate-500'}`}>
            {d.online ? 'Online' : 'Offline'}
          </span>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (d: Device) => (
        <span className="text-slate-400 text-sm">{d.vehiclePlate ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d: Device) => (
        <div onClick={e => e.stopPropagation()}>
          <ActionsMenu
            onView={() => navigate(`/fleet/devices/${d.id}`)}
            onEdit={() => { setEditDevice(d); setSlideOverOpen(true) }}
            onDelete={() => setDeleteId(d.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Devices</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
            {onlineCount} Online
            <span className="text-slate-500 mx-2">·</span>
            <span className="inline-block h-2 w-2 rounded-full bg-slate-500 mr-1.5" />
            {offlineCount} Offline
          </p>
        </div>
        <Button onClick={() => { setEditDevice(null); setSlideOverOpen(true) }}>
          <Plus size={16} /> Registrar Dispositivo
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search by IMEI..."
            leftIcon={<Search size={16} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Table
          columns={columns as never}
          data={filtered as never[]}
          loading={devicesLoading}
          emptyMessage="No devices found"
          onRowClick={d => navigate(`/fleet/devices/${(d as Device).id}`)}
        />
      </div>

      <DeviceSlideOver
        open={slideOverOpen}
        onClose={() => { setSlideOverOpen(false); setEditDevice(null) }}
        device={editDevice}
      />

      <Modal open={deleteId != null} onClose={() => setDeleteId(null)} title="Delete Device" size="sm">
        <p className="text-sm text-slate-400 mb-6">
          Are you sure you want to delete this device? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
