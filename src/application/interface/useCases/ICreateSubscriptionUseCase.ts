import { RazorpayOrder } from "../../../application/interface/services/IRazorpayService";

export interface ICreateSubscriptionUseCase {
  execute(userId: string, planId: string): Promise<RazorpayOrder>;
}
