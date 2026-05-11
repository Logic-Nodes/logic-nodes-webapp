// ─── AUTH ───────────────────────────────────────────────────────────────────
export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: number;
  email: string;
  roles: string[];
}

// ─── VEHICLE ─────────────────────────────────────────────────────────────────
export type VehicleStatus = 'IN_SERVICE' | 'OUT_OF_SERVICE' | 'MAINTENANCE' | 'RETIRED';
export type VehicleType = 'Van' | 'Truck' | 'Motorcycle' | 'Car' | string;

export interface Vehicle {
  id: number;
  plate: string;
  type: VehicleType;
  capabilities: string[] | null;
  status: VehicleStatus;
  odometerKm: number;
  deviceImeis: string[] | null;
}

export interface CreateVehicleDto {
  plate: string;
  type: string;
  capabilities: string[];
  status: string;
  odometerKm: number;
  deviceImeis: string[];
}

// ─── DEVICE ──────────────────────────────────────────────────────────────────
export interface Device {
  id: number;
  imei: string;
  firmware: string;
  online: boolean;
  vehiclePlate?: string | null;
}

export interface CreateDeviceDto {
  imei: string;
  firmware: string;
  online: boolean;
  vehiclePlate?: string | null;
}

// ─── ALERT ───────────────────────────────────────────────────────────────────
export interface Incident {
  id: number;
  alertId: number;
  description: string;
  createdAt: string;
  acknowledgedAt?: string | null;
  closedAt?: string | null;
}

export interface AlertNotification {
  id: number;
  alertId: number;
  notificationChannel: string;
  message: string;
  sentAt: string;
}

export interface Alert {
  id: number;
  alertType: string;
  alertStatus: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED';
  createdAt: string;
  closedAt?: string | null;
  description: string;
  deliveryOrderId?: number;
  incidents?: Incident[];
  notifications?: AlertNotification[];
}

// ─── ORIGIN POINT ────────────────────────────────────────────────────────────
export interface OriginPoint {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// ─── DELIVERY ORDER ──────────────────────────────────────────────────────────
export interface DeliveryOrder {
  id: number;
  tripId: number;
  clientEmail: string;
  sequenceOrder: number;
  address: string;
  latitude: number;
  longitude: number;
  maxHumidity: number | null;
  minHumidity: number | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  maxVibration: number | null;
  arrivalAt: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface CreateDeliveryOrderDto {
  clientEmail: string;
  address: string;
  latitude: number;
  longitude: number;
  sequenceOrder: number;
  maxHumidity?: number | null;
  minHumidity?: number | null;
  maxTemperature?: number | null;
  minTemperature?: number | null;
  maxVibration?: number | null;
}

// ─── TRIP ────────────────────────────────────────────────────────────────────
export type TripStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Trip {
  id: number;
  statusId: number;
  driverId: number;
  driverName: string;
  deviceId: number;
  vehicleId: number;
  merchantId: number;
  departureAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  originPoint: OriginPoint;
  deliveryOrders: DeliveryOrder[];
}

export interface CreateTripDto {
  driverId: number;
  deviceId: number;
  vehicleId: number;
  merchantId: number;
  originPointId: number;
  deliveryOrders: CreateDeliveryOrderDto[];
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
export interface Profile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  documentType: string | null;
  document: string | null;
  birthDate: string | null;
}

export interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  documentType: string | null;
  document: string | null;
  birthDate: string | null;
}

// ─── BILLING ─────────────────────────────────────────────────────────────────
export interface Plan {
  id: number;
  name: string;
  limits: string;
  price: number;
  description: string;
}

export interface Subscription {
  id: number;
  userId: number;
  status: 'ACTIVE' | 'CANCELED' | 'PENDING' | 'PAST_DUE';
  renewal: string;
  paymentMethod: string;
  plan: Plan;
}

export interface Payment {
  id: number;
  userId: number;
  receiptUrl: string;
  transactionId: string;
  status: string;
  amount: number;
  paymentDate: string;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export interface DashboardTrip {
  id: string;
  startDate: string;
  endDate: string;
  origin: string;
  destination: string;
  vehiclePlate: string;
  driverName: string;
  cargoType: string;
  status: string;
  distance: number;
  alerts: string[];
}

export interface DashboardAlert {
  id: string;
  tripId: string;
  deviceId: string;
  vehiclePlate: string;
  type: string;
  severity: string;
  value?: number;
  timestamp: string;
  location: { latitude: number; longitude: number; address: string };
  resolved: boolean;
}

export interface IncidentsByMonth {
  id: number;
  month: string;
  year: number;
  temperatureIncidents: number;
  movementIncidents: number;
  totalIncidents: number;
}
