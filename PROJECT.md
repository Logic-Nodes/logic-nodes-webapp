# OmniTrack — React Frontend

Migración del frontend Angular 20 a React 19. Plataforma de monitoreo de carga en tiempo real (temperatura, humedad, vibración, ubicación).

---

## Stack

| Categoría | Tecnología |
|-----------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Estilos | Tailwind CSS v4 |
| Estado global | Zustand 5 |
| Routing | React Router v7 |
| HTTP | Axios |
| Formularios | React Hook Form |
| Gráficas | Recharts |
| Iconos | Lucide React |
| Notificaciones | react-hot-toast |
| Auth (decode) | jwt-decode |

---

## Estructura del proyecto

```
omnitrack-react/
├── src/
│   ├── api/              # Capa de acceso a la API
│   │   ├── client.ts         # Axios instance + interceptores
│   │   ├── auth.api.ts
│   │   ├── vehicles.api.ts
│   │   ├── devices.api.ts
│   │   ├── trips.api.ts
│   │   ├── alerts.api.ts
│   │   ├── profile.api.ts
│   │   ├── billing.api.ts
│   │   └── dashboard.api.ts
│   ├── store/            # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── fleet.store.ts
│   │   ├── trips.store.ts
│   │   └── alerts.store.ts
│   ├── components/
│   │   ├── ui/           # Componentes reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Card.tsx
│   │   └── layout/
│   │       ├── AuthGuard.tsx     # Protección de rutas
│   │       ├── RootLayout.tsx    # Layout principal con sidebar
│   │       └── Sidebar.tsx       # Navegación lateral con roles
│   ├── pages/
│   │   ├── auth/         # Login, Register
│   │   ├── dashboard/    # Dashboard + TripDetail (gráficas)
│   │   ├── fleet/        # Vehicles, VehicleDetail, Devices, DeviceDetail
│   │   ├── trips/        # TripsPage, TripCreate, TripDetail
│   │   ├── alerts/       # AlertsPage
│   │   ├── profile/      # ProfilePage
│   │   └── subscriptions/# SubscriptionsPage
│   ├── types/
│   │   └── index.ts      # Todos los interfaces TypeScript
│   ├── utils/
│   │   └── cn.ts         # Helper clsx + twMerge
│   ├── App.tsx           # Rutas React Router
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind + theme tokens
```

---

## Rutas

| Ruta | Página | Roles |
|------|--------|-------|
| `/login` | LoginPage | Público |
| `/register` | RegisterPage | Público |
| `/dashboard` | DashboardPage | Todos |
| `/dashboard/trips/:id` | TripDetailDashboard | Todos |
| `/fleet/vehicles` | VehiclesPage | ADMIN / OPERATOR |
| `/fleet/vehicles/:id` | VehicleDetailPage | ADMIN / OPERATOR |
| `/fleet/devices` | DevicesPage | ADMIN / OPERATOR |
| `/fleet/devices/:id` | DeviceDetailPage | ADMIN / OPERATOR |
| `/trips` | TripsPage | Todos |
| `/trips/new` | TripCreatePage | Todos |
| `/trips/:id` | TripDetailPage | Todos |
| `/alerts` | AlertsPage | Todos |
| `/profile` | ProfilePage | Todos |
| `/subscriptions` | SubscriptionsPage | ADMIN / OPERATOR |

---

## Autenticación

- JWT almacenado en `localStorage` (`access_token`, `refresh_token`)
- El payload del JWT contiene: `uid`, `email`, `roles[]`
- `jwt-decode` parsea el token en el store sin verificar firma
- `AuthGuard` redirige a `/login` si no hay sesión
- El Sidebar filtra ítems según rol (`isAdmin()`, `isOperator()`)

---

## Fake API (desarrollo local)

La API real requiere PostgreSQL. Para desarrollo se usa una fake API con Express + json-server.

**Ubicación:** `C:\Users\luigg\OneDrive\Documents\GitHub\iot-solutions-development-omnitrack-frontend-main\server\`

**Arrancar el backend:**
```bash
cd iot-solutions-development-omnitrack-frontend-main
node server/auth-middleware.js
```
Corre en `http://localhost:8080`

**Credenciales de prueba:**

| Email | Password | Rol |
|-------|----------|-----|
| admin@mail.com | admin | ADMIN |
| operator@mail.com | operator | OPERATOR |
| driver@mail.com | driver | DRIVER |

**Notas:**
- Los datos viven en `server/db.json` — se resetean si se reinicia el servidor
- Crear/editar/eliminar funciona mientras el servidor esté corriendo
- El middleware maneja 52 endpoints incluyendo auth con JWT falso

---

## Arrancar el frontend

```bash
cd omnitrack-react
npm install
npm run dev
```
Corre en `http://localhost:5173`

**Asegurarse de tener el backend corriendo primero.**

---

## Variables de entorno

Para apuntar a un backend desplegado (cuando se haga deploy), crear `.env`:

```env
VITE_API_URL=https://tu-backend.railway.app/api/v1
```

El `client.ts` usa `import.meta.env.VITE_API_URL` con fallback a `http://localhost:8080/api/v1`.

---

## Colores de marca

Definidos en `src/index.css` como tokens de Tailwind v4:

| Token | Valor |
|-------|-------|
| `brand-500` | `#11a9d0` |
| `brand-600` | `#0e8fb0` |
| `brand-50` | `#f0fafd` |
| `brand-100` | `#d0eef6` |
| `brand-700` | `#0b7a96` |

---

## Pendiente / Próximas mejoras

- [ ] Mejoras de UI (en curso)
- [ ] Deploy frontend (Vercel) + backend (Railway/Render)
- [ ] Conectar con backend real (PostgreSQL)
- [ ] Paginación del lado del servidor
- [ ] Manejo de refresh token automático
