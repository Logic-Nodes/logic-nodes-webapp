import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTripsStore } from '@/store/trips.store'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import type { DeliveryOrder, TripStatus } from '@/types'

const STATUS_BADGE: Record<TripStatus, 'success' | 'error' | 'blue' | 'gray'> = {
  COMPLETED: 'success',
  CANCELLED: 'error',
  IN_PROGRESS: 'blue',
  CREATED: 'gray',
}

const STATUS_LABELS: Record<TripStatus, string> = {
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  IN_PROGRESS: 'In Progress',
  CREATED: 'Created',
}

function formatDate(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleString()
}

function tempRange(order: DeliveryOrder) {
  if (order.minTemperature !== null || order.maxTemperature !== null) {
    const min = order.minTemperature !== null ? `${order.minTemperature}°C` : '—'
    const max = order.maxTemperature !== null ? `${order.maxTemperature}°C` : '—'
    return `${min} / ${max}`
  }
  return 'Not configured'
}

function humidityRange(order: DeliveryOrder) {
  if (order.minHumidity !== null || order.maxHumidity !== null) {
    const min = order.minHumidity !== null ? `${order.minHumidity}%` : '—'
    const max = order.maxHumidity !== null ? `${order.maxHumidity}%` : '—'
    return `${min} / ${max}`
  }
  return 'Not configured'
}

const deliveryColumns = [
  { key: 'id', header: 'ID' },
  { key: 'sequenceOrder', header: 'Sequence' },
  { key: 'clientEmail', header: 'Client Email' },
  { key: 'address', header: 'Address' },
  {
    key: 'arrivalAt',
    header: 'Arrival At',
    render: (row: DeliveryOrder) => formatDate(row.arrivalAt),
  },
  {
    key: 'temperature',
    header: 'Temperature',
    render: (row: DeliveryOrder) => tempRange(row),
  },
  {
    key: 'humidity',
    header: 'Humidity',
    render: (row: DeliveryOrder) => humidityRange(row),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row: DeliveryOrder) => (
      <Badge variant="gray">{row.status}</Badge>
    ),
  },
]

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { trip, loading, loadTripById } = useTripsStore()

  useEffect(() => {
    if (id) loadTripById(id)
  }, [id, loadTripById])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 gap-2 text-slate-500">
        <svg className="animate-spin h-5 w-5 text-brand-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading...
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex items-center justify-center min-h-64 text-slate-500">
        Trip not found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white">Trip #{trip.id}</h1>
          <p className="text-sm text-slate-400">Created at {formatDate(trip.createdAt)}</p>
        </div>
        <Badge variant={STATUS_BADGE[trip.status]}>
          {STATUS_LABELS[trip.status] ?? trip.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Assigned to</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-white">
              {trip.driverName || 'Juan Jose'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Driver ID: {trip.driverId}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Origin Point</p>
          </CardHeader>
          <CardContent>
            {trip.originPoint ? (
              <>
                <p className="text-sm font-medium text-white">{trip.originPoint.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{trip.originPoint.address}</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Delivery Orders</h2>
        <Table<DeliveryOrder & Record<string, unknown>>
          columns={deliveryColumns as Parameters<typeof Table>[0]['columns']}
          data={(trip.deliveryOrders ?? []) as (DeliveryOrder & Record<string, unknown>)[]}
          emptyMessage="No delivery orders"
        />
      </div>
    </div>
  )
}
