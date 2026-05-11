import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ArrowLeft } from 'lucide-react'
import { dashboardApi } from '@/api/dashboard.api'
import type { DashboardTrip, DashboardAlert } from '@/types'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-slate-200 mt-0.5">{value}</p>
    </div>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/5 rounded-xl ${className ?? ''}`} />
}

export function TripDetailDashboard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [trip, setTrip] = useState<DashboardTrip | null>(null)
  const [alerts, setAlerts] = useState<DashboardAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      dashboardApi.getTripById(id),
      dashboardApi.getAlertsByTripId(id),
    ]).then(([t, a]) => {
      setTrip(t)
      setAlerts(a)
    }).finally(() => setLoading(false))
  }, [id])

  const tempAlerts = alerts
    .filter(a => a.type === 'TEMPERATURE')
    .map(a => ({ time: formatTimestamp(a.timestamp), value: a.value, raw: a.timestamp }))
    .sort((a, b) => new Date(a.raw).getTime() - new Date(b.raw).getTime())

  const vibAlerts = alerts
    .filter(a => a.type === 'MOVEMENT' || a.type === 'VIBRATION')
    .map(a => ({ time: formatTimestamp(a.timestamp), value: a.value, raw: a.timestamp }))
    .sort((a, b) => new Date(a.raw).getTime() - new Date(b.raw).getTime())

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard - Cargo Monitoring</h1>
        <p className="text-sm text-slate-400 mt-1">Trip detail and sensor readings</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>
      ) : !trip ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">Trip not found.</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-white">Trip Information</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-5">
                <InfoItem label="Driver" value={trip.driverName} />
                <InfoItem label="Cargo Type" value={trip.cargoType} />
                <InfoItem label="Trip Start" value={formatDate(trip.startDate)} />
                <InfoItem label="Route" value={`${trip.origin} → ${trip.destination}`} />
                <InfoItem label="Distance" value={`${trip.distance} km`} />
                <InfoItem label="Trip End" value={formatDate(trip.endDate)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-white">Temperature vs Time</h2>
            </CardHeader>
            <CardContent className="pt-4">
              {tempAlerts.length === 0 ? (
                <div className="flex items-center justify-center h-56 text-slate-500 text-sm">No temperature data for this trip</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={tempAlerts} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} unit="°C" />
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
              {vibAlerts.length === 0 ? (
                <div className="flex items-center justify-center h-56 text-slate-500 text-sm">No vibration data for this trip</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={vibAlerts} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
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
      )}
    </div>
  )
}
