import { useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  fleet: 'Fleet',
  vehicles: 'Vehicles',
  devices: 'Devices',
  trips: 'Trips',
  alerts: 'Alerts',
  profile: 'Profile',
  subscriptions: 'Subscriptions',
  new: 'Nueva Ruta',
}

export function Topbar() {
  const { pathname } = useLocation()
  const user = useAuthStore(s => s.user)

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map(s => ROUTE_LABELS[s] ?? (isNaN(Number(s)) ? s : 'Detail'))

  return (
    <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-white/8 bg-white/[0.03] backdrop-blur-sm">
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-white/30"><Home size={13} /></span>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight size={11} className="text-white/20" />
            <span className={i === crumbs.length - 1 ? 'text-white/80 font-medium' : 'text-white/30'}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-semibold ring-2 ring-[#2563EB]/30">
        {user?.email?.[0]?.toUpperCase() ?? 'U'}
      </div>
    </header>
  )
}
