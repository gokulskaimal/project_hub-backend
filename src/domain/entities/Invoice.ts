export interface Invoice {
  id: string;
  orgId: string;
  orgName?: string;
  planId: string;
  planName?: string;
  planType?: "STARTER" | "PRO" | "ENTERPRISE";
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED";
  billingDate: Date;
  invoicePdfUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
