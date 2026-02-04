import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IWebhookEventHandler } from "../../interface/webhook/IWebhookEventHandler";
import { ISubscriptionRepo } from "../../../infrastructure/interface/repositories/ISubscriptionRepo";
import { RazorpaySubscription } from "../../../infrastructure/interface/services/IRazorpayService";

interface WebhookPayload {
  subscription: {
    entity: RazorpaySubscription;
  };
}

@injectable()
export class SubscriptionChargedHandler implements IWebhookEventHandler {
  constructor(
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
  ) {}

  async handle(payload: unknown): Promise<void> {
    const data = payload as WebhookPayload;
    const subscription = data.subscription.entity;

    await this._subscriptionRepo.updateByRazorpayId(subscription.id, {
      status: "active",
      currentPeriodStart: subscription.current_start
        ? new Date(subscription.current_start * 1000)
        : new Date(),
      currentPeriodEnd: subscription.current_end
        ? new Date(subscription.current_end * 1000)
        : new Date(),
    });
  }
}
