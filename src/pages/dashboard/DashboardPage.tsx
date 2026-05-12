import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Truck, Bell, AlertTriangle, Activity, ArrowRight, Package, Thermometer, Wifi, WifiOff } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard.api'
import type { DashboardTrip, DashboardAlert, IncidentsByMonth } from '@/types'
import { useFleetStore } from '@/store/fleet.store'
import { useLiveTemperature } from '@/hooks/useLiveTemperature'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function statusBadgeVariant(status: string): 'success' | 'blue' | 'gray' | 'error' {
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'IN_PROGRESS': return 'blue'
    case 'CREATED': return 'gray'
    case 'CANCELLED': return 'error'
    default: return 'gray'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'COMPLETED': return 'Completado'
    case 'IN_PROGRESS': return 'En Curso'
    case 'CREATED': return 'Creado'
    case 'CANCELLED': return 'Cancelado'
    default: return status
  }
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-white/5 rounded-xl', className)} />
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { vehicles, loadVehicles } = useFleetStore()

  const [trips, setTrips] = useState<DashboardTrip[]>([])
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [incidents, setIncidents] = useState<IncidentsByMonth[]>([])
  const [loading, setLoading] = useState(true)

  const [period, setPeriod] = useState('12m')
  const [alertTypeFilter, setAlertTypeFilter] = useState<'ALL' | 'TEMPERATURE' | 'MOVEMENT'>('ALL')
  const { readings: liveReadings, loading: liveLoading } = useLiveTemperature(8000)

  useEffect(() => {
    Promise.all([
      dashboardApi.getTrips(),
      dashboardApi.getAlerts(),
      dashboardApi.getIncidentsByMonth(),
      loadVehicles(),
    ]).then(([t, a, i]) => {
      setTrips(t)
      setAlerts(a)
      setIncidents(i)
    }).finally(() => setLoading(false))
  }, [loadVehicles])

  const totalTrips = trips.length
  const activeTrips = trips.filter(t => t.status === 'IN_PROGRESS').length
  const totalAlerts = alerts.length
  const pendingAlerts = alerts.filter(a => !a.resolved).length

  const chartData = useMemo(() => {
    let filtered = incidents
    const periodMap: Record<string, number> = { '3m': 3, '6m': 6, '12m': 12 }
    const count = periodMap[period] ?? 12
    filtered = filtered.slice(-count)

    return filtered.map(inc => ({
      label: `${inc.month.slice(0, 3)} ${inc.year}`,
      temperature: alertTypeFilter === 'MOVEMENT' ? 0 : inc.temperatureIncidents,
      movement: alertTypeFilter === 'TEMPERATURE' ? 0 : inc.movementIncidents,
    }))
  }, [incidents, period, alertTypeFilter])

  const recentTrips = trips.slice(0, 5)

  const vehicleStatusCounts = useMemo(() => ({
    inService: vehicles.filter(v => v.status === 'IN_SERVICE').length,
    maintenance: vehicles.filter(v => v.status === 'MAINTENANCE').length,
    outOfService: vehicles.filter(v => v.status === 'OUT_OF_SERVICE').length,
  }), [vehicles])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonBlock className="h-8 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-28" />)}
        </div>
        <SkeletonBlock className="h-80" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <SkeletonBlock className="h-64 lg:col-span-3" />
          <SkeletonBlock className="h-64 lg:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
        <p className="text-sm text-slate-400 mt-1">Vista general de tu flota, rutas activas y alertas en tiempo real</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rutas */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-5 border border-white/10 border-l-4 border-l-[#3B82F6]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400 font-medium mb-1">Total Rutas</p>
              <p className="text-3xl font-bold text-white">{totalTrips}</p>
              <p className="text-xs text-emerald-400 mt-1">+12% último mes</p>
            </div>
            <Truck className="text-[#3B82F6]" size={28} />
          </div>
        </div>
        {/* Rutas Activas */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-5 border border-white/10 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400 font-medium mb-1">Rutas Activas</p>
              <p className="text-3xl font-bold text-white">{activeTrips}</p>
              <p className="text-xs text-emerald-400 mt-1">+12% último mes</p>
            </div>
            <Activity className="text-blue-400" size={28} />
          </div>
        </div>
        {/* Total Alertas */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-5 border border-white/10 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400 font-medium mb-1">Total Alertas</p>
              <p className="text-3xl font-bold text-white">{totalAlerts}</p>
              <p className="text-xs text-emerald-400 mt-1">+12% último mes</p>
            </div>
            <Bell className="text-amber-400" size={28} />
          </div>
        </div>
        {/* Alertas Pendientes */}
        <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl p-5 border border-white/10 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-slate-400 font-medium mb-1">Alertas Pendientes</p>
              <p className="text-3xl font-bold text-white">{pendingAlerts}</p>
              <p className="text-xs text-emerald-400 mt-1">+12% último mes</p>
            </div>
            <AlertTriangle className="text-red-400" size={28} />
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Sensor Activity Overview</h2>
              {/* Manual legend */}
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  Temperature
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Movement
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Period buttons */}
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                {(['3m', '6m', '12m'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? 'bg-[#3B82F6] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {/* Alert type filter */}
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                {(['ALL', 'TEMPERATURE', 'MOVEMENT'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setAlertTypeFilter(type)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${alertTypeFilter === type ? 'bg-[#3B82F6] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    {type === 'ALL' ? 'All' : type === 'TEMPERATURE' ? 'Temperature' : 'Movement'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">No data for selected range</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                {alertTypeFilter !== 'MOVEMENT' && (
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                )}
                {alertTypeFilter !== 'TEMPERATURE' && (
                  <Area
                    type="monotone"
                    dataKey="movement"
                    name="Movement"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Real-time Temperature Monitoring */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer size={18} className="text-[#3B82F6]" />
              <h2 className="text-base font-semibold text-white">Temperatura en Tiempo Real</h2>
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                En vivo
              </span>
            </div>
            <span className="text-xs text-slate-500">Actualiza cada 8s</span>
          </div>
        </CardHeader>
        <CardContent>
          {liveLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : liveReadings.length === 0 ? (
            <div className="flex items-center gap-3 text-slate-500 text-sm py-4">
              <WifiOff size={16} />
              No hay dispositivos IoT en línea
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {liveReadings.map(reading => {
                const isAlert = reading.status === 'ALERT'
                const pct = Math.min(100, Math.max(0, ((reading.temperature - reading.minTemperature) / (reading.maxTemperature - reading.minTemperature)) * 100))
                return (
                  <div
                    key={reading.deviceId}
                    className={cn(
                      'rounded-xl border p-4 transition-all',
                      isAlert
                        ? 'border-red-500/40 bg-red-500/10'
                        : 'border-white/10 bg-white/[0.04]'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-slate-400 truncate max-w-[70px]">
                        {reading.vehiclePlate ?? reading.imei.slice(-6)}
                      </span>
                      {isAlert
                        ? <AlertTriangle size={12} className="text-red-400 shrink-0" />
                        : <Wifi size={12} className="text-emerald-400 shrink-0" />
                      }
                    </div>
                    <p className={cn(
                      'text-2xl font-bold tabular-nums',
                      isAlert ? 'text-red-400' : 'text-white'
                    )}>
                      {reading.temperature > 0 ? '+' : ''}{reading.temperature}°C
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rango: {reading.minTemperature}° / {reading.maxTemperature}°C
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-1000',
                          isAlert ? 'bg-red-500' : 'bg-[#3B82F6]'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 3: Recent Activity + Fleet Status */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Actividad Reciente (60%) */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <h2 className="text-base font-semibold text-white">Actividad Reciente</h2>
          </CardHeader>
          <CardContent className="p-0">
            {recentTrips.length === 0 ? (
              <p className="text-sm text-slate-400 px-6 py-6">No trips found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Evento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Tiempo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {recentTrips.map(trip => (
                    <tr
                      key={trip.id}
                      className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                      onClick={() => navigate(`/dashboard/trips/${trip.id}`)}
                    >
                      <td className="px-6 py-3 font-medium text-slate-200">{trip.vehiclePlate}</td>
                      <td className="px-6 py-3 text-slate-400">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>{trip.origin}</span>
                          <ArrowRight size={10} />
                          <span className="truncate max-w-[80px]">{trip.destination}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">{formatRelativeTime(trip.startDate)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={statusBadgeVariant(trip.status)} dot>
                          {statusLabel(trip.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Estado de Flota (40%) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-base font-semibold text-white">Estado de Flota</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-300">En servicio</span>
              </div>
              <span className="text-sm font-semibold text-white">{vehicleStatusCounts.inService}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-sm text-slate-300">Mantenimiento</span>
              </div>
              <span className="text-sm font-semibold text-white">{vehicleStatusCounts.maintenance}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-sm text-slate-300">Fuera de servicio</span>
              </div>
              <span className="text-sm font-semibold text-white">{vehicleStatusCounts.outOfService}</span>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Package size={14} />
                <span>{totalTrips} rutas totales registradas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
