import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Play, ArrowRight, Package } from 'lucide-react'
import { useTripsStore } from '@/store/trips.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Trip, TripStatus } from '@/types'

const STATUS_LABELS: Record<TripStatus, string> = {
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  IN_PROGRESS: 'En Curso',
  CREATED: 'Creada',
}

const STATUS_BADGE: Record<TripStatus, 'success' | 'error' | 'blue' | 'gray'> = {
  COMPLETED: 'success',
  CANCELLED: 'error',
  IN_PROGRESS: 'blue',
  CREATED: 'gray',
}

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'CREATED', label: 'Creadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

function formatDate(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function TripsPage() {
  const navigate = useNavigate()
  const { trips, loading, loadTrips, startTrip } = useTripsStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => { loadTrips() }, [loadTrips])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return trips.filter(t => {
      if (q && !String(t.id).includes(q) && !t.driverName?.toLowerCase().includes(q)) return false
      if (statusFilter && t.status !== statusFilter) return false
      return true
    })
  }, [trips, search, statusFilter])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trips</h1>
          <p className="text-sm text-slate-400 mt-0.5">{trips.length} rutas registradas</p>
        </div>
        <Button onClick={() => navigate('/trips/new')}>
          <Plus size={16} />
          Nueva Ruta
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search by ID or driver..."
          leftIcon={<Search size={16} />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-0 border-b border-white/10">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              statusFilter === tab.value
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <p className="text-sm">No trips found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(trip => (
            <div
              key={trip.id}
              className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-5 cursor-pointer hover:bg-white/[0.08] transition-colors"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded font-mono">
                  #{trip.id}
                </span>
                <Badge variant={STATUS_BADGE[trip.status]} dot>
                  {STATUS_LABELS[trip.status] ?? trip.status}
                </Badge>
              </div>

              {/* Driver */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-full bg-[#3B82F6] text-white text-xs flex items-center justify-center font-medium shrink-0">
                  {trip.driverName?.[0]?.toUpperCase() ?? 'D'}
                </div>
                <span className="text-sm font-medium text-white truncate">{trip.driverName || `Driver #${trip.driverId}`}</span>
              </div>

              {/* Route */}
              {trip.originPoint && (
                <div className="flex items-start gap-1.5 text-sm text-slate-300 mb-3">
                  <span className="leading-snug">{trip.originPoint.name}</span>
                  <ArrowRight size={12} className="shrink-0 text-slate-400 mt-1" />
                  <span className="text-slate-400 text-xs leading-snug">{trip.deliveryOrders?.length ?? 0} entregas</span>
                </div>
              )}

              {/* Stats & footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Package size={12} />
                  <span>{trip.deliveryOrders?.length ?? 0} entregas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{formatDate(trip.createdAt)}</span>
                  {trip.status === 'CREATED' && (
                    <button
                      className="flex items-center gap-1 text-xs text-[#3B82F6] font-medium hover:underline"
                      onClick={e => { e.stopPropagation(); startTrip(trip.id) }}
                    >
                      <Play size={10} /> Iniciar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
