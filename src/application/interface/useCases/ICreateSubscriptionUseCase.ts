import { RazorpaySubscription } from "../../../infrastructure/interface/services/IRazorpayService";

export interface ICreateSubscriptionUseCase {
  execute(userId: string, planId: string): Promise<RazorpaySubscription>;
}
