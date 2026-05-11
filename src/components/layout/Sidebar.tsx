import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Truck, Cpu, MapPin, Bell, User, CreditCard, LogOut } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/auth.store'

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-lg w-full',
          isActive
            ? 'bg-[#2563EB] text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  const { user, logout, isAdmin, isOperator } = useAuthStore()
  const navigate = useNavigate()
  const canSeeAdmin = isAdmin() || isOperator()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="flex h-screen w-60 flex-col bg-[#1E293B] shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-700">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]">
          <MapPin size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">OmniTrack</p>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">Fleet Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Section: MAIN */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-2 pb-1">Main</p>
        <NavItem to="/dashboard" icon={<LayoutGrid size={16} />} label="Dashboard" />

        {/* Section: FLEET - only for admin/operator */}
        {canSeeAdmin && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-4 pb-1">Fleet</p>
            <NavItem to="/fleet/vehicles" icon={<Truck size={16} />} label="Vehicles" />
            <NavItem to="/fleet/devices" icon={<Cpu size={16} />} label="Devices" />
          </>
        )}

        {/* Section: OPERATIONS */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-4 pb-1">Operations</p>
        <NavItem to="/trips" icon={<MapPin size={16} />} label="Trips" />
        <NavItem to="/alerts" icon={<Bell size={16} />} label="Alerts" />

        {/* Section: ACCOUNT */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-4 pb-1">Account</p>
        <NavItem to="/profile" icon={<User size={16} />} label="Profile" />
        {canSeeAdmin && <NavItem to="/subscriptions" icon={<CreditCard size={16} />} label="Subscriptions" />}
      </nav>

      {/* Footer - user info */}
      <div className="border-t border-slate-700 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.roles?.[0]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}
