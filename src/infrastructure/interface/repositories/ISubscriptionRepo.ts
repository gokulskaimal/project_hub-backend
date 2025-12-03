import { Subscription } from "../../../domain/entities/Subscription";
export interface ISubscriptionRepo {
  create(
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
  ): Promise<Subscription>;
  findByUserId(userId: string): Promise<Subscription | null>;
  findByRazorpaySubscriptionId(
    razorpaySubscriptionId: string,
  ): Promise<Subscription | null>;
  update(
    id: string,
    subscription: Partial<Subscription>,
  ): Promise<Subscription | null>; // Fixed signature
  updateByRazorpayId(
    razorpayId: string,
    subscription: Partial<Subscription>,
  ): Promise<Subscription | null>;
}
