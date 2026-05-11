import { useEffect, useMemo, useState } from 'react'
import { Eye, CheckCircle, AlertTriangle, Thermometer, Activity, Droplets, Bell } from 'lucide-react'
import { useAlertsStore } from '@/store/alerts.store'
import type { Alert } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Table } from '@/components/ui/Table'

function formatDate(value?: string | null) {
  if (!value) return '---'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusBadge(status: string) {
  const map: Record<string, 'error' | 'warning' | 'success' | 'gray'> = {
    OPEN: 'error',
    ACKNOWLEDGED: 'warning',
    CLOSED: 'success',
  }
  return <Badge variant={map[status] ?? 'gray'} dot>{status}</Badge>
}

function alertTypeIcon(alertType: string) {
  switch (alertType) {
    case 'HIGH_TEMPERATURE':
      return <Thermometer size={14} className="text-red-500" />
    case 'EXCESSIVE_VIBRATION':
      return <Activity size={14} className="text-amber-500" />
    case 'HIGH_HUMIDITY':
      return <Droplets size={14} className="text-blue-500" />
    default:
      return <Bell size={14} className="text-slate-400" />
  }
}

function alertTypeLabel(alertType: string) {
  switch (alertType) {
    case 'HIGH_TEMPERATURE': return 'Temperatura'
    case 'EXCESSIVE_VIBRATION': return 'Vibración'
    case 'HIGH_HUMIDITY': return 'Humedad'
    default: return alertType
  }
}

function getSeverity(alertType: string): 'error' | 'warning' | 'gray' {
  if (['HIGH_TEMPERATURE', 'EXCESSIVE_VIBRATION'].includes(alertType)) return 'error'
  return 'warning'
}

function getSeverityLabel(alertType: string) {
  if (['HIGH_TEMPERATURE', 'EXCESSIVE_VIBRATION'].includes(alertType)) return 'HIGH'
  return 'MEDIUM'
}

export function AlertsPage() {
  const { alerts, loading, loadAlerts, acknowledgeAlert, closeAlert } = useAlertsStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState<Alert | null>(null)
  const [closing, setClosing] = useState<number | null>(null)
  const [acknowledging, setAcknowledging] = useState<number | null>(null)

  useEffect(() => { loadAlerts() }, [loadAlerts])

  const filtered = useMemo(() => {
    return alerts.filter(a => {
      const matchSearch =
        !search ||
        a.alertType.toLowerCase().includes(search.toLowerCase()) ||
        String(a.deliveryOrderId ?? '').includes(search)
      const matchStatus = !statusFilter || a.alertStatus === statusFilter
      return matchSearch && matchStatus
    })
  }, [alerts, search, statusFilter])

  const activeCount = alerts.filter(a => a.alertStatus !== 'CLOSED').length

  const handleClose = async (id: number) => {
    setClosing(id)
    try { await closeAlert(id) } finally { setClosing(null) }
  }

  const handleAcknowledge = async (id: number) => {
    setAcknowledging(id)
    try { await acknowledgeAlert(id) } finally { setAcknowledging(null) }
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (row: Alert) => <span className="text-slate-400 text-xs">#{row.id}</span>,
    },
    {
      key: 'alertType',
      header: 'Type',
      render: (row: Alert) => (
        <div className="flex items-center gap-1.5">
          {alertTypeIcon(row.alertType)}
          <span className="text-sm text-slate-300">{alertTypeLabel(row.alertType)}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (row: Alert) => (
        <Badge variant={getSeverity(row.alertType)}>
          {getSeverityLabel(row.alertType)}
        </Badge>
      ),
    },
    {
      key: 'deliveryOrderId',
      header: 'Delivery Order ID',
      render: (row: Alert) => row.deliveryOrderId != null ? String(row.deliveryOrderId) : '---',
    },
    {
      key: 'alertStatus',
      header: 'Status',
      render: (row: Alert) => statusBadge(row.alertStatus),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row: Alert) => {
        const date = row.incidents?.[0]?.createdAt ?? row.createdAt
        return <span className="text-xs text-slate-500">{formatDate(date)}</span>
      },
    },
    {
      key: 'closedAt',
      header: 'Closed',
      render: (row: Alert) => {
        const date = row.incidents?.[0]?.closedAt ?? row.closedAt
        return <span className="text-xs text-slate-500">{formatDate(date)}</span>
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Alert) => {
        if (row.alertStatus === 'CLOSED') {
          return (
            <Badge variant="success" dot>Resuelto</Badge>
          )
        }
        return (
          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              variant="danger"
              loading={closing === row.id}
              disabled={closing === row.id}
              onClick={e => { e.stopPropagation(); handleClose(row.id) }}
            >
              Mark as resolved
            </Button>
            {row.alertStatus === 'OPEN' && (
              <Button
                size="sm"
                variant="secondary"
                loading={acknowledging === row.id}
                disabled={acknowledging === row.id}
                onClick={e => { e.stopPropagation(); handleAcknowledge(row.id) }}
              >
                Acknowledge
              </Button>
            )}
          </div>
        )
      },
    },
    {
      key: 'details',
      header: 'Details',
      render: (row: Alert) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={e => { e.stopPropagation(); setSelected(row) }}
        >
          <Eye size={15} />
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Alerts</h1>

      {/* Active alerts banner */}
      {activeCount > 0 ? (
        <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-300">{activeCount} alertas activas</p>
            <p className="text-xs text-red-400">Requieren atención inmediata</p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="text-emerald-400 shrink-0" size={20} />
          <p className="text-sm font-semibold text-emerald-300">No hay alertas activas</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by type or delivery order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="sm:w-52">
          <Select
            placeholder="All statuses"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[
              { value: 'OPEN', label: 'Open' },
              { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
          />
        </div>
      </div>

      <div>
        <Table
          columns={columns as never}
          data={filtered as never[]}
          loading={loading}
          emptyMessage="No alerts found"
        />
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Alert Details"
        size="md"
      >
        {selected && (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400 font-medium">Type</dt>
              <dd className="flex items-center gap-1.5">
                {alertTypeIcon(selected.alertType)}
                <span className="text-white">{alertTypeLabel(selected.alertType)}</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400 font-medium">Status</dt>
              <dd>{statusBadge(selected.alertStatus)}</dd>
            </div>
            {selected.deliveryOrderId != null && (
              <div className="flex justify-between">
                <dt className="text-slate-400 font-medium">Delivery Order ID</dt>
                <dd className="text-white">{selected.deliveryOrderId}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-400 font-medium">Created</dt>
              <dd className="text-white">
                {formatDate(selected.incidents?.[0]?.createdAt ?? selected.createdAt)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400 font-medium">Closed</dt>
              <dd className="text-white">
                {formatDate(selected.incidents?.[0]?.closedAt ?? selected.closedAt)}
              </dd>
            </div>
            {(selected.incidents?.[0]?.description ?? selected.description) && (
              <div className="pt-2 border-t border-white/10">
                <dt className="text-slate-400 font-medium mb-1">Description</dt>
                <dd className="text-white leading-relaxed">
                  {selected.incidents?.[0]?.description ?? selected.description}
                </dd>
              </div>
            )}
          </dl>
        )}
      </Modal>
    </div>
  )
}
