import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Cpu, Wifi, WifiOff, Car } from 'lucide-react'
import { useFleetStore } from '@/store/fleet.store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

export function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { device, devicesLoading, loadDeviceById, updateOnline, updateFirmware } = useFleetStore()

  const [onlineLoading, setOnlineLoading] = useState(false)
  const [firmwareOpen, setFirmwareOpen] = useState(false)
  const [firmwareLoading, setFirmwareLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ firmware: string }>()

  useEffect(() => {
    if (id) loadDeviceById(Number(id))
  }, [id, loadDeviceById])

  const handleToggleOnline = async () => {
    if (!device) return
    setOnlineLoading(true)
    try {
      await updateOnline(device.id, !device.online)
      if (id) loadDeviceById(Number(id))
    } finally {
      setOnlineLoading(false)
    }
  }

  const onFirmwareSubmit = async (data: { firmware: string }) => {
    if (!device) return
    setFirmwareLoading(true)
    try {
      await updateFirmware(device.id, data.firmware)
      reset()
      setFirmwareOpen(false)
      if (id) loadDeviceById(Number(id))
    } finally {
      setFirmwareLoading(false)
    }
  }

  if (devicesLoading && !device) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-500">
          <svg className="animate-spin h-5 w-5 text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading device...
        </div>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="p-6">
        <p className="text-slate-400">Device not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/fleet/devices')}>
          <ArrowLeft size={16} /> Back to Devices
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white font-mono">{device.imei}</h1>
        <Badge variant={device.online ? 'success' : 'gray'}>
          {device.online ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-white">Device Information</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                  <Cpu size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">IMEI</p>
                  <p className="text-white font-mono font-medium mt-0.5">{device.imei}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                  <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Firmware</p>
                  <p className="text-white font-medium mt-0.5">{device.firmware}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                  {device.online ? (
                    <Wifi size={16} className="text-brand-600" />
                  ) : (
                    <WifiOff size={16} className="text-brand-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Status</p>
                  <div className="mt-1">
                    <Badge variant={device.online ? 'success' : 'gray'}>
                      {device.online ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-500/10 p-2 mt-0.5">
                  <Car size={16} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Assigned Vehicle</p>
                  <p className="text-white font-medium mt-0.5">{device.vehiclePlate ?? '—'}</p>
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
                loading={onlineLoading}
                onClick={handleToggleOnline}
              >
                {device.online ? (
                  <><WifiOff size={15} /> Set Offline</>
                ) : (
                  <><Wifi size={15} /> Set Online</>
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => { reset({ firmware: device.firmware }); setFirmwareOpen(true) }}
              >
                Update Firmware
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <Button variant="ghost" onClick={() => navigate('/fleet/devices')}>
          <ArrowLeft size={16} /> Back to Devices
        </Button>
      </div>

      <Modal
        open={firmwareOpen}
        onClose={() => { setFirmwareOpen(false); reset() }}
        title="Update Firmware"
        size="sm"
      >
        <form onSubmit={handleSubmit(onFirmwareSubmit)} className="flex flex-col gap-4">
          <Input
            label="Firmware Version"
            id="firmware"
            placeholder="e.g. v2.0.1"
            error={errors.firmware?.message}
            {...register('firmware', { required: 'Firmware version is required' })}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => { setFirmwareOpen(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" loading={firmwareLoading}>Update</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
