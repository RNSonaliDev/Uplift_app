import { api } from './client';

export interface Plan {
  id: number;
  name: string;
  code: string;
  plan_type: string;
  price: number;
  price_cents?: number;
  processing_fee: number;
  processing_fee_cents?: number;
  processing_fee_label?: string;
  amount: number;
  amount_cents?: number;
  duration_days: number;
  placement_rank?: number;
  badge?: string;
  description: string;
  active: boolean;
}

export interface PlanPurchase {
  id: number;
  status: string;
  base_amount: number;
  base_amount_cents?: number;
  processing_fee: number;
  processing_fee_cents?: number;
  processing_fee_label?: string;
  amount: number;
  amount_cents?: number;
  currency?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  paid_at?: string | null;
  plan: Plan;
  purchasable_type: string;
  purchasable_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanPurchaseResponse {
  plan_purchase: PlanPurchase;
  client_secret: string;
  publishable_key?: string;
  payment_security_note?: string;
  powered_by_stripe_note?: string;
}

export const plansApi = {
  getPlans: async (planType: string = 'job'): Promise<Plan[]> => {
    // 1. Try specified planType (e.g. 'job')
    try {
      const data = await api.get<Plan[]>(`/plans?plan_type=${planType}`);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn(`[plansApi] Failed to fetch plans for plan_type=${planType}`, err);
    }

    // 2. Fallback to promotion plans if query with planType was empty or failed
    try {
      const promoData = await api.get<Plan[]>('/plans?plan_type=promotion');
      if (Array.isArray(promoData) && promoData.length > 0) {
        return promoData;
      }
    } catch (err) {
      console.warn('[plansApi] Failed to fetch fallback promotion plans', err);
    }

    // 3. Fallback to general /plans
    try {
      const generalData = await api.get<Plan[]>('/plans');
      if (Array.isArray(generalData)) {
        return generalData;
      }
    } catch (err) {
      console.warn('[plansApi] Failed to fetch general plans', err);
    }

    return [];
  },

  createPlanPurchase: async (
    jobId: number | string,
    planId: number | string
  ): Promise<CreatePlanPurchaseResponse> => {
    return api.post<CreatePlanPurchaseResponse>(`/job_posts/${jobId}/plan_purchases`, {
      plan_purchase: {
        plan_id: planId,
      },
    });
  },

  createPromotionPlanPurchase: async (
    promotionId: number | string,
    planId: number | string
  ): Promise<CreatePlanPurchaseResponse> => {
    return api.post<CreatePlanPurchaseResponse>(`/promotions/${promotionId}/plan_purchases`, {
      plan_purchase: {
        plan_id: planId,
      },
    });
  },

  confirmPlanPurchase: async (purchaseId: number | string): Promise<PlanPurchase> => {
    return api.post<PlanPurchase>(`/plan_purchases/${purchaseId}/confirm`, {});
  },
};

