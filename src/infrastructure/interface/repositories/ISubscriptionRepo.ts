import { Subscription } from "../../../domain/entities/Subscription";
import { IBaseRepository } from "./IBaseRepo";

export interface ISubscriptionRepo extends IBaseRepository<Subscription> {
  findByUserId(userId: string): Promise<Subscription | null>;
  findByRazorpaySubscriptionId(razorpaySubscriptionId: string): Promise<Subscription | null>;
  updateByRazorpayId(razorpayId: string, subscription: Partial<Subscription>): Promise<Subscription | null>;
}
