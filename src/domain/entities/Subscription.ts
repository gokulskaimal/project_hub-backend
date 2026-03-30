export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  razorpaySubscriptionId: string;
  razorpayCustomerId: string;
  status:
    | "active"
    | "created"
    | "authenticated"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}
