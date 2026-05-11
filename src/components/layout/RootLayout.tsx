import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function RootLayout() {
  return (
    <div className="flex h-full">
      {/* Background glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-40 w-[500px] h-[500px] bg-[#3B82F6] rounded-full opacity-[0.06] blur-3xl" />
        <div className="absolute -bottom-60 -right-40 w-[600px] h-[600px] bg-[#3B82F6] rounded-full opacity-[0.05] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500 rounded-full opacity-[0.02] blur-3xl" />
      </div>

      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
