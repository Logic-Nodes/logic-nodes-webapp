import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { billingApi } from '@/api/billing.api'
import type { Plan, Payment, Subscription } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'

const PLAN_FEATURES: Record<string, string[]> = {
  BASIC: ['2 vehículos', 'Alertas básicas', 'Soporte email'],
  STANDARD: ['5 vehículos', 'Alertas avanzadas', 'Soporte prioritario', 'Reportes mensuales'],
  PREMIUM: ['Ilimitados vehículos', 'Alertas en tiempo real', 'Soporte 24/7', 'Reportes avanzados', 'API access'],
}

function getFeatures(planName: string): string[] {
  const upper = planName.toUpperCase()
  for (const key of Object.keys(PLAN_FEATURES)) {
    if (upper.includes(key)) return PLAN_FEATURES[key]
  }
  return []
}

function formatDate(value?: string | null) {
  if (!value) return '---'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusBadge(status: string) {
  const map: Record<string, 'success' | 'error' | 'warning' | 'gray'> = {
    ACTIVE: 'success',
    CANCELED: 'error',
    PENDING: 'warning',
    PAST_DUE: 'warning',
  }
  return <Badge variant={map[status] ?? 'gray'} dot>{status}</Badge>
}

function paymentStatusBadge(status: string) {
  const map: Record<string, 'success' | 'error' | 'warning' | 'gray'> = {
    PAID: 'success',
    FAILED: 'error',
    PENDING: 'warning',
    REFUNDED: 'gray',
  }
  return <Badge variant={map[status.toUpperCase()] ?? 'gray'}>{status}</Badge>
}

export function SubscriptionsPage() {
  const user = useAuthStore(s => s.user)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [changingPlan, setChangingPlan] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      billingApi.getSubscription(user.id),
      billingApi.getPlans(),
      billingApi.getPayments(user.id),
    ])
      .then(([sub, pl, pay]) => {
        setSubscription(sub)
        setPlans(pl)
        setPayments(pay)
      })
      .catch(() => toast.error('Failed to load billing data'))
      .finally(() => setLoading(false))
  }, [user])

  const handleCancelSubscription = async () => {
    if (!subscription) return
    setCancelling(true)
    try {
      await billingApi.cancelSubscription(subscription.id)
      setSubscription(prev => prev ? { ...prev, status: 'CANCELED' } : prev)
      toast.success('Subscription cancelled')
      setCancelModalOpen(false)
    } catch {
      toast.error('Failed to cancel subscription')
    } finally {
      setCancelling(false)
    }
  }

  const handleChangePlan = async (planId: number) => {
    if (!subscription) return
    setChangingPlan(planId)
    try {
      const updated = await billingApi.changePlan(subscription.id, planId)
      setSubscription(updated)
      toast.success('Plan changed successfully')
    } catch {
      toast.error('Failed to change plan')
    } finally {
      setChangingPlan(null)
    }
  }

  const paymentColumns = [
    {
      key: 'amount',
      header: 'Amount',
      render: (row: Payment) => `$${row.amount.toFixed(2)}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Payment) => paymentStatusBadge(row.status),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row: Payment) => row.transactionId,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row: Payment) => formatDate(row.paymentDate),
    },
  ]

  if (!user) return null

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-white">Subscriptions</h1>

      {/* Plan Actual */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-200">Plan Actual</h2>
        {loading ? (
          <div className="h-20 bg-white/5 animate-pulse rounded-xl" />
        ) : !subscription ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center text-slate-400 text-sm">
            No active subscription found.
          </div>
        ) : (
          <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">{subscription.plan.name}</span>
                {statusBadge(subscription.status)}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span>
                  <span className="font-medium">Renews:</span>{' '}
                  {formatDate(subscription.renewal)}
                </span>
                <span>
                  <span className="font-medium">Payment:</span>{' '}
                  {subscription.paymentMethod}
                </span>
                <span>
                  <span className="font-medium text-white">${subscription.plan.price}</span>
                  <span className="text-slate-400">/mes</span>
                </span>
              </div>
              {subscription.plan.description && (
                <p className="text-sm text-slate-400">{subscription.plan.description}</p>
              )}
            </div>
            {subscription.status !== 'CANCELED' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setCancelModalOpen(true)}
                className="shrink-0"
              >
                Cancelar suscripción
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Planes Disponibles */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-200">Planes Disponibles</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white/5 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(plan => {
              const isCurrent = subscription?.plan.id === plan.id
              const features = getFeatures(plan.name)
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border overflow-hidden ${
                    isCurrent
                      ? 'border-[#3B82F6] ring-1 ring-[#3B82F6]'
                      : 'border-white/10'
                  }`}
                >
                  <div className={`px-5 py-4 ${isCurrent ? 'bg-[#3B82F6]' : 'bg-white/[0.05] border-b border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{plan.name}</h3>
                      {isCurrent && (
                        <span className="text-xs font-medium text-white bg-white/20 px-2 py-0.5 rounded-full">
                          Plan Actual
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/[0.03] px-5 py-5 space-y-4">
                    <div>
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-sm text-slate-400">/mes</span>
                    </div>

                    {features.length > 0 && (
                      <ul className="space-y-2">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                            <Check
                              size={14}
                              className={isCurrent ? 'text-[#3B82F6]' : 'text-slate-400'}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    {plan.description && !features.length && (
                      <p className="text-sm text-slate-400">{plan.description}</p>
                    )}

                    <Button
                      variant={isCurrent ? 'secondary' : 'primary'}
                      size="sm"
                      className="w-full"
                      disabled={isCurrent || changingPlan !== null}
                      loading={changingPlan === plan.id}
                      onClick={() => handleChangePlan(plan.id)}
                    >
                      {isCurrent ? 'Current plan' : 'Choose plan'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Historial de Pagos */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-200">Historial de Pagos</h2>
        <div>
          <Table
            columns={paymentColumns as never}
            data={payments as never[]}
            loading={loading}
            emptyMessage="No payment records found"
          />
        </div>
      </section>

      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Subscription"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Are you sure you want to cancel your subscription? You will lose access to premium
            features at the end of the current billing period.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Keep subscription
            </Button>
            <Button
              variant="danger"
              loading={cancelling}
              onClick={handleCancelSubscription}
            >
              Yes, cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
