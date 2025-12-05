export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayCustomer {
  id: string;
  email: string;
  name: string;
  contact?: string;
  created_at: number;
}

export interface RazorpaySubscription {
  id: string;
  entity?: string;
  plan_id: string;
  customer_id?: string;
  status: string;
  current_start?: number;
  current_end?: number;
  ended_at?: number;
  quantity?: number;
  notes?: Record<string, string | number>;
  charge_at?: number;
  start_at?: number;
  end_at?: number;
  auth_attempts?: number;
  total_count?: number;
  paid_count?: number;
  customer_notify?: boolean;
  created_at: number;
  expire_by?: number;
  short_url?: string;
  has_scheduled_changes?: boolean;
  change_scheduled_at?: number;
  source?: string;
}

export interface RazorpayPlan {
  id: string;
  interval: number;
  period: string;
  item: {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
  };
  created_at: number;
}

export interface IRazorpayService {
  createOrder(
    amount: number,
    currency: string,
    receipt: string,
  ): Promise<RazorpayOrder>;
  createSubscription(
    planId: string,
    totalCount: number,
    customerId?: string,
  ): Promise<RazorpaySubscription>;
  verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean;
  createCustomer(
    name: string,
    email: string,
    contact?: string,
  ): Promise<string>;
  createPlan(
    name: string,
    description: string,
    amount: number,
    currency: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    interval: number,
  ): Promise<string>;
  fetchSubscription(
    subscriptionId: string,
  ): Promise<RazorpaySubscription | null>;
}
