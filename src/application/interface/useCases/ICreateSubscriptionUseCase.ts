import { RazorpayOrder } from "../../../infrastructure/interface/services/IRazorpayService";

export interface ICreateSubscriptionUseCase {
  execute(userId: string, planId: string): Promise<RazorpayOrder>;
}
