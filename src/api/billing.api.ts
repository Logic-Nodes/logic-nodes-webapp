import { apiClient } from './client'
import type { Plan, Subscription, Payment } from '../types'

export const billingApi = {
  getPlans: () => apiClient.get<Plan[]>('/plans').then(r => r.data),
  getSubscription: (userId: number | string) =>
    apiClient.get<Subscription>(`/subscription/user-id/${userId}`).then(r => r.data),
  changePlan: (subscriptionId: number, newPlanId: number) =>
    apiClient.put<Subscription>(`/subscription/${subscriptionId}/plan`, { newPlanId }).then(r => r.data),
  cancelSubscription: (subscriptionId: number) =>
    apiClient.delete(`/subscription/${subscriptionId}`),
  getPayments: (userId: number | string) =>
    apiClient.get<Payment[]>(`/payments/user-id/${userId}`).then(r => r.data),
}
