import { RazorpaySubscription } from "../services/IRazorpayService";

export interface IHandleRazorpayWebhookUseCase {
  execute(event: string, subscription: RazorpaySubscription): Promise<void>;
}
