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
  plan_id: string;
  customer_id?: string;
  status: string;
  current_start?: number;
  current_end?: number;
  created_at: number;
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
}
