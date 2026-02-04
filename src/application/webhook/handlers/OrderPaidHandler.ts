import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { IWebhookEventHandler } from "../../interface/webhook/IWebhookEventHandler";
import { IOrgRepo } from "../../../infrastructure/interface/repositories/IOrgRepo";
import { IPlanRepo } from "../../../infrastructure/interface/repositories/IPlanRepo";
import { RazorpayOrder } from "../../../infrastructure/interface/services/IRazorpayService";

interface WebhookPayload {
  order: {
    entity: RazorpayOrder;
  };
}

@injectable()
export class OrderPaidHandler implements IWebhookEventHandler {
  constructor(
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
  ) {}

  async handle(payload: unknown): Promise<void> {
    // Safe casting with defined interface
    const data = payload as WebhookPayload;
    const order = data.order.entity;

    if (!order.notes || !order.notes.planId || !order.notes.orgId) {
      console.warn("Webhook Order Missing Notes: ", order.id);
      return;
    }

    const planId = order.notes.planId as string;
    const orgId = order.notes.orgId as string;

    const plan = await this._planRepo.findById(planId);
    if (!plan) {
      console.warn("Webhook Plan Not Found: ", planId);
      return;
    }

    const validForDays = plan.duration || 30; // Will fix interface next
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + validForDays);

    await this._orgRepo.update(orgId, {
      subscriptionStatus: "ACTIVE",
      razorpaySubscriptionId: order.id,
      planId: plan.id,
      subscriptionStartsAt: new Date(),
      subscriptionEndsAt: endsAt,
      maxUsers: plan.limits?.members || 5,
      maxManagers: plan.limits?.projects || 2,
      features: plan.features || [],
    });
  }
}
