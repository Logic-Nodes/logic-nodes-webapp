import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { ArrowLeft, Pencil, Plus, X, Thermometer, Droplets, Activity, Check } from 'lucide-react'
import { useTripsStore } from '@/store/trips.store'
import { useFleetStore } from '@/store/fleet.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SlideOver } from '@/components/ui/SlideOver'
import { Card, CardContent } from '@/components/ui/Card'
import type { CreateDeliveryOrderDto, OriginPoint } from '@/types'

interface TripFormValues {
  driverId: string
  codriver: string
  vehicleId: string
  originPointId: string
}

interface DeliveryOrderForm {
  clientEmail: string
  address: string
  latitude: string
  longitude: string
  enableTemperature: boolean
  minTemperature: string
  maxTemperature: string
  enableHumidity: boolean
  minHumidity: string
  enableVibration: boolean
  maxVibration: string
  notes: string
}

const defaultOrderForm: DeliveryOrderForm = {
  clientEmail: '',
  address: '',
  latitude: '',
  longitude: '',
  enableTemperature: false,
  minTemperature: '',
  maxTemperature: '',
  enableHumidity: false,
  minHumidity: '',
  enableVibration: false,
  maxVibration: '',
  notes: '',
}

const STEPS = [
  { number: 1, label: 'Información del Viaje' },
  { number: 2, label: 'Ruta y Entregas' },
  { number: 3, label: 'Revisión' },
]

function StepperHeader({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step.number < currentStep
                  ? 'bg-[#3B82F6] text-white'
                  : step.number === currentStep
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-white/10 text-slate-500'
              }`}
            >
              {step.number < currentStep ? <Check size={16} /> : step.number}
            </div>
            <span className={`text-xs font-medium ${step.number === currentStep ? 'text-[#3B82F6]' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-16 mx-2 mb-5 ${step.number < currentStep ? 'bg-[#3B82F6]' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export function TripCreatePage() {
  const navigate = useNavigate()
  const { originPoints, loadOriginPoints, createTrip } = useTripsStore()
  const { vehicles, loadVehicles } = useFleetStore()

  const [step, setStep] = useState(1)
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrderForm[]>([])
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [orderForm, setOrderForm] = useState<DeliveryOrderForm>(defaultOrderForm)
  const [orderErrors, setOrderErrors] = useState<Partial<Record<keyof DeliveryOrderForm, string>>>({})
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TripFormValues>({
    defaultValues: { driverId: '', codriver: '', vehicleId: '', originPointId: '' },
  })

  const selectedVehicleId = watch('vehicleId')
  const watchedValues = watch()
  const selectedVehicle = vehicles.find(v => String(v.id) === selectedVehicleId)
  const deviceImei = selectedVehicle?.deviceImeis?.[0] ?? ''

  useEffect(() => {
    loadVehicles()
    loadOriginPoints()
  }, [loadVehicles, loadOriginPoints])

  function openAddModal() {
    setEditingIndex(null)
    setOrderForm(defaultOrderForm)
    setOrderErrors({})
    setSlideOverOpen(true)
  }

  function openEditModal(index: number) {
    setEditingIndex(index)
    setOrderForm(deliveryOrders[index])
    setOrderErrors({})
    setSlideOverOpen(true)
  }

  function removeOrder(index: number) {
    setDeliveryOrders(prev => prev.filter((_, i) => i !== index))
  }

  function validateOrder(): boolean {
    const errs: typeof orderErrors = {}
    if (!orderForm.clientEmail) errs.clientEmail = 'Required'
    if (!orderForm.address) errs.address = 'Required'
    setOrderErrors(errs)
    return Object.keys(errs).length === 0
  }

  function saveOrder() {
    if (!validateOrder()) return
    if (editingIndex !== null) {
      setDeliveryOrders(prev => prev.map((o, i) => (i === editingIndex ? orderForm : o)))
    } else {
      setDeliveryOrders(prev => [...prev, orderForm])
    }
    setSlideOverOpen(false)
  }

  async function onSubmit(values: TripFormValues) {
    setSaving(true)
    try {
      const orders: CreateDeliveryOrderDto[] = deliveryOrders.map((o, i) => ({
        clientEmail: o.clientEmail,
        address: o.address,
        latitude: parseFloat(o.latitude) || 0,
        longitude: parseFloat(o.longitude) || 0,
        sequenceOrder: i + 1,
        minTemperature: o.enableTemperature && o.minTemperature !== '' ? parseFloat(o.minTemperature) : null,
        maxTemperature: o.enableTemperature && o.maxTemperature !== '' ? parseFloat(o.maxTemperature) : null,
        minHumidity: o.enableHumidity && o.minHumidity !== '' ? parseFloat(o.minHumidity) : null,
        maxHumidity: null,
        maxVibration: o.enableVibration && o.maxVibration !== '' ? parseFloat(o.maxVibration) : null,
      }))

      await createTrip({
        driverId: parseInt(values.driverId) || 0,
        vehicleId: parseInt(values.vehicleId),
        deviceId: selectedVehicle?.id ?? 0,
        merchantId: 0,
        originPointId: parseInt(values.originPointId),
        deliveryOrders: orders,
      })
      navigate('/trips')
    } finally {
      setSaving(false)
    }
  }

  const vehicleOptions = vehicles.map(v => ({ value: v.id, label: v.plate }))
  const originOptions = originPoints.map((op: OriginPoint) => ({
    value: op.id,
    label: op.name,
  }))

  const selectedOrigin = originPoints.find((op: OriginPoint) => String(op.id) === watchedValues.originPointId)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">Nueva Ruta</h1>
      </div>

      <StepperHeader currentStep={step} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Step 1: Información del Viaje */}
        {step === 1 && (
          <Card>
            <CardContent className="flex flex-col gap-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Driver ID"
                  placeholder="Driver ID"
                  error={errors.driverId?.message}
                  {...register('driverId', { required: 'Required' })}
                />
                <Input
                  label="Co-driver (optional)"
                  placeholder="Co-driver"
                  {...register('codriver')}
                />
              </div>

              <Controller
                name="vehicleId"
                control={control}
                rules={{ required: 'Required' }}
                render={({ field }) => (
                  <Select
                    label="Vehicle"
                    options={vehicleOptions}
                    placeholder="Select vehicle"
                    error={errors.vehicleId?.message}
                    {...field}
                  />
                )}
              />

              <Input
                label="Device IMEI"
                value={deviceImei}
                readOnly
                disabled
                placeholder="Auto-filled from selected vehicle"
                helperText="Se llena automáticamente al seleccionar un vehículo"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Ruta y Entregas */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="flex flex-col gap-4 pt-4">
                <Controller
                  name="originPointId"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <Select
                      label="Origin Point"
                      options={originOptions}
                      placeholder="Select origin point"
                      error={errors.originPointId?.message}
                      {...field}
                    />
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Órdenes de Entrega</h2>
                <Button type="button" variant="secondary" size="sm" onClick={openAddModal}>
                  <Plus size={16} />
                  Add
                </Button>
              </div>

              {deliveryOrders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-xl text-slate-500">
                  <p className="text-sm">Aún no se han agregado órdenes de entrega</p>
                </div>
              )}

              {deliveryOrders.map((order, i) => (
                <Card key={i}>
                  <CardContent className="py-3 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <p className="font-medium text-white">{order.address}</p>
                      <p className="text-slate-400">{order.clientEmail}</p>
                      <p className="text-slate-500 text-xs">
                        {order.latitude || '—'}, {order.longitude || '—'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {order.enableTemperature ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">
                            <Thermometer size={12} />
                            {order.minTemperature}°–{order.maxTemperature}°
                          </span>
                        ) : null}
                        {order.enableHumidity ? (
                          <span className="inline-flex items-center gap-1 text-xs text-cyan-400 bg-cyan-500/15 px-2 py-0.5 rounded-full">
                            <Droplets size={12} />
                            {order.minHumidity}%
                          </span>
                        ) : null}
                        {order.enableVibration ? (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-full">
                            <Activity size={12} />
                            max {order.maxVibration}
                          </span>
                        ) : null}
                        {!order.enableTemperature && !order.enableHumidity && !order.enableVibration && (
                          <span className="text-xs text-slate-400">No parameters set</span>
                        )}
                      </div>
                      {order.notes && <p className="text-xs text-slate-500 mt-1">Note: {order.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button type="button" variant="ghost" size="sm" onClick={() => openEditModal(i)}>
                        <Pencil size={14} />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeOrder(i)}>
                        <X size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Revisión */}
        {step === 3 && (
          <Card>
            <CardContent className="flex flex-col gap-4 pt-4">
              <h2 className="text-base font-semibold text-white mb-2">Resumen del Viaje</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-sm text-slate-400 font-medium">Driver ID</span>
                  <span className="text-sm text-white font-semibold">{watchedValues.driverId || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-sm text-slate-400 font-medium">Vehicle</span>
                  <span className="text-sm text-white font-semibold">{selectedVehicle?.plate ?? '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-sm text-slate-400 font-medium">Origin Point</span>
                  <span className="text-sm text-white font-semibold">{selectedOrigin?.name ?? '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-slate-400 font-medium">Delivery Orders</span>
                  <span className="text-sm text-white font-semibold">{deliveryOrders.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <div>
            {step > 1 && (
              <Button type="button" variant="secondary" onClick={() => setStep(s => s - 1)}>
                Anterior
              </Button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <Button type="button" onClick={() => setStep(s => s + 1)}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" loading={saving}>
                Guardar Ruta
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Delivery Order SlideOver */}
      <SlideOver
        open={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
        title={editingIndex !== null ? 'Edit Delivery Order' : 'Add Delivery Order'}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSlideOverOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveOrder}>
              {editingIndex !== null ? 'Update' : 'Add'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Client Email"
            placeholder="client@example.com"
            value={orderForm.clientEmail}
            onChange={e => setOrderForm(f => ({ ...f, clientEmail: e.target.value }))}
            error={orderErrors.clientEmail}
          />
          <Input
            label="Address"
            placeholder="Delivery address"
            value={orderForm.address}
            onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))}
            error={orderErrors.address}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Latitude"
              type="number"
              placeholder="0.0000"
              value={orderForm.latitude}
              onChange={e => setOrderForm(f => ({ ...f, latitude: e.target.value }))}
            />
            <Input
              label="Longitude"
              type="number"
              placeholder="0.0000"
              value={orderForm.longitude}
              onChange={e => setOrderForm(f => ({ ...f, longitude: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={orderForm.enableTemperature}
                onChange={e => setOrderForm(f => ({ ...f, enableTemperature: e.target.checked }))}
                className="h-4 w-4 rounded border-white/20 text-brand-500 focus:ring-brand-500 bg-white/5"
              />
              <span className="text-sm font-medium text-slate-300">Temperature monitoring</span>
            </label>
            {orderForm.enableTemperature && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <Input
                  label="Min Temperature (°C)"
                  type="number"
                  value={orderForm.minTemperature}
                  onChange={e => setOrderForm(f => ({ ...f, minTemperature: e.target.value }))}
                />
                <Input
                  label="Max Temperature (°C)"
                  type="number"
                  value={orderForm.maxTemperature}
                  onChange={e => setOrderForm(f => ({ ...f, maxTemperature: e.target.value }))}
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={orderForm.enableHumidity}
                onChange={e => setOrderForm(f => ({ ...f, enableHumidity: e.target.checked }))}
                className="h-4 w-4 rounded border-white/20 text-brand-500 focus:ring-brand-500 bg-white/5"
              />
              <span className="text-sm font-medium text-slate-300">Humidity monitoring</span>
            </label>
            {orderForm.enableHumidity && (
              <div className="pl-6">
                <Input
                  label="Min Humidity (%)"
                  type="number"
                  value={orderForm.minHumidity}
                  onChange={e => setOrderForm(f => ({ ...f, minHumidity: e.target.value }))}
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={orderForm.enableVibration}
                onChange={e => setOrderForm(f => ({ ...f, enableVibration: e.target.checked }))}
                className="h-4 w-4 rounded border-white/20 text-brand-500 focus:ring-brand-500 bg-white/5"
              />
              <span className="text-sm font-medium text-slate-300">Vibration monitoring</span>
            </label>
            {orderForm.enableVibration && (
              <div className="pl-6">
                <Input
                  label="Max Vibration"
                  type="number"
                  value={orderForm.maxVibration}
                  onChange={e => setOrderForm(f => ({ ...f, maxVibration: e.target.value }))}
                />
              </div>
            )}
          </div>

          <Input
            label="Notes (optional)"
            placeholder="Any special instructions"
            value={orderForm.notes}
            onChange={e => setOrderForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </SlideOver>
    </div>
  )
}
