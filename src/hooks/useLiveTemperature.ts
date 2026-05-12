import { useEffect, useState, useRef } from 'react'
import { apiClient } from '@/api/client'

export interface LiveReading {
  deviceId: number
  imei: string
  vehiclePlate: string | null
  temperature: number
  minTemperature: number
  maxTemperature: number
  status: 'NORMAL' | 'ALERT'
  timestamp: string
}

function generateReading(device: { id: number; imei: string; vehiclePlate?: string | null }, tick: number): LiveReading {
  const minTemp = -5
  const maxTemp = 8
  const base = (minTemp + maxTemp) / 2
  const amplitude = (maxTemp - minTemp) * 0.4
  const phase = device.id * 1.7
  const rawTemp = base + amplitude * Math.sin((tick / 10 + phase))
  const noise = (Math.random() - 0.5) * 0.4
  const temperature = parseFloat((rawTemp + noise).toFixed(1))
  const isOutOfRange = temperature < minTemp || temperature > maxTemp
  return {
    deviceId: device.id,
    imei: device.imei,
    vehiclePlate: device.vehiclePlate ?? null,
    temperature,
    minTemperature: minTemp,
    maxTemperature: maxTemp,
    status: isOutOfRange ? 'ALERT' : 'NORMAL',
    timestamp: new Date().toISOString(),
  }
}

export function useLiveTemperature(intervalMs = 8000) {
  const [readings, setReadings] = useState<LiveReading[]>([])
  const [loading, setLoading] = useState(true)
  const tickRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      try {
        const { data: devices } = await apiClient.get('/fleet/devices')
        const online = (devices as { id: number; imei: string; vehiclePlate?: string | null; online: boolean }[]).filter(d => d.online)
        if (!cancelled) {
          tickRef.current += 1
          setReadings(online.map(d => generateReading(d, tickRef.current)))
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    refresh()
    const id = setInterval(refresh, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [intervalMs])

  return { readings, loading }
}
