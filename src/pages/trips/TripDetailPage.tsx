import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileDown } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTripsStore } from '@/store/trips.store'
import { dashboardApi } from '@/api/dashboard.api'
import type { DashboardAlert } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import type { DeliveryOrder, TripStatus } from '@/types'
import { generateTripPdf } from '@/utils/tripPdf'

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

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { trip, loading, loadTripById } = useTripsStore()
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])

  useEffect(() => {
    if (id) {
      loadTripById(id)
      dashboardApi.getAlertsByTripId(id).then(setAlerts).catch(() => {})
    }
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
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_BADGE[trip.status]}>
            {STATUS_LABELS[trip.status] ?? trip.status}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generateTripPdf(trip)}
          >
            <FileDown size={15} />
            Descargar PDF
          </Button>
        </div>
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

        {trip.startedAt && (
          <Card>
            <CardHeader>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Started At</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">{formatDate(trip.startedAt)}</p>
            </CardContent>
          </Card>
        )}

        {trip.completedAt && (
          <Card>
            <CardHeader>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Completed At</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-white">{formatDate(trip.completedAt)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Delivery Orders</h2>
        <Table<DeliveryOrder & Record<string, unknown>>
          columns={deliveryColumns as Parameters<typeof Table>[0]['columns']}
          data={(trip.deliveryOrders ?? []) as (DeliveryOrder & Record<string, unknown>)[]}
          emptyMessage="No delivery orders"
        />
      </div>

      {(() => {
        const tempData = alerts
          .filter(a => a.type === 'TEMPERATURE')
          .map(a => ({ time: formatTimestamp(a.timestamp), value: a.value ?? 0, raw: a.timestamp }))
          .sort((a, b) => new Date(a.raw).getTime() - new Date(b.raw).getTime())

        const vibData = alerts
          .filter(a => a.type === 'MOVEMENT' || a.type === 'VIBRATION')
          .map(a => ({ time: formatTimestamp(a.timestamp), value: a.value ?? 0, raw: a.timestamp }))
          .sort((a, b) => new Date(a.raw).getTime() - new Date(b.raw).getTime())

        return (
          <>
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-white">Temperature vs Time</h2>
              </CardHeader>
              <CardContent className="pt-4">
                {tempData.length === 0 ? (
                  <div className="flex items-center justify-center h-56 text-slate-500 text-sm">
                    No temperature data for this trip
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={tempData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="°C" />
                      <Tooltip formatter={(v: number) => [`${v} °C`, 'Temperature']} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Temperature"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-white">Vibration vs Time</h2>
              </CardHeader>
              <CardContent className="pt-4">
                {vibData.length === 0 ? (
                  <div className="flex items-center justify-center h-56 text-slate-500 text-sm">
                    No vibration data for this trip
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={vibData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v: number) => [`${v}`, 'Vibration']} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Vibration"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </>
        )
      })()}
    </div>
  )
}
