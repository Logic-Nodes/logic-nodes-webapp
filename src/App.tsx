import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { RootLayout } from '@/components/layout/RootLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { TripDetailDashboard } from '@/pages/dashboard/TripDetailDashboard'
import { VehiclesPage } from '@/pages/fleet/VehiclesPage'
import { VehicleDetailPage } from '@/pages/fleet/VehicleDetailPage'
import { DevicesPage } from '@/pages/fleet/DevicesPage'
import { DeviceDetailPage } from '@/pages/fleet/DeviceDetailPage'
import { TripsPage } from '@/pages/trips/TripsPage'
import { TripCreatePage } from '@/pages/trips/TripCreatePage'
import { TripDetailPage } from '@/pages/trips/TripDetailPage'
import { AlertsPage } from '@/pages/alerts/AlertsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { SubscriptionsPage } from '@/pages/subscriptions/SubscriptionsPage'

export default function App() {
  const loadUserFromToken = useAuthStore(s => s.loadUserFromToken)

  useEffect(() => {
    loadUserFromToken()
  }, [loadUserFromToken])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<AuthGuard />}>
          <Route element={<RootLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/trips/:id" element={<TripDetailDashboard />} />
            <Route path="/fleet/vehicles" element={<VehiclesPage />} />
            <Route path="/fleet/vehicles/:id" element={<VehicleDetailPage />} />
            <Route path="/fleet/devices" element={<DevicesPage />} />
            <Route path="/fleet/devices/:id" element={<DeviceDetailPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/new" element={<TripCreatePage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
