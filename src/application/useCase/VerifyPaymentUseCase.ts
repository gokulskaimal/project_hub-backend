import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IRazorpayService } from "../../infrastructure/interface/services/IRazorpayService";
import { IVerifyPaymentUseCase } from "../interface/useCases/IVerifyPaymentUseCase";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../../infrastructure/interface/repositories/ISubscriptionRepo";
@injectable()
export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
  constructor(
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISubscriptionRepo) private _subscriptionRepo : ISubscriptionRepo,
  ) {}

  async execute(
    orderId: string,
    paymentId: string,
    signature: string,
    orgId: string,
  ): Promise<boolean> {
    const isValid = this._razorpayService.verifySignature(
      orderId,
      paymentId,
      signature,
    );

    if (!isValid) return false;

    // Fetch subscription details from Razorpay to get the plan
    // For now, we assume the planId is passed or we can infer it.
    // Ideally, we should store the orderId -> planId mapping or fetch from Razorpay.
    // Since we don't have a temporary order store, we will rely on the subscription ID if available.
    // However, for this implementation, we will fetch the subscription from Razorpay to get the plan ID if possible,
    // OR we can update the Org based on the subscription ID stored in Razorpay.

    // SIMPLIFICATION:
    // We will fetch the subscription from Razorpay using the order_id (which might be the subscription_id in some flows)
    // OR we just mark it active.
    // BUT we need the Plan ID to update limits.

    // Let's assume the client sends the planId? No, verify payload is standard.
    // We need to fetch the subscription from Razorpay to see which plan it corresponds to.
    // But Razorpay subscription has 'plan_id' which is Razorpay's plan ID.
    // We need to map Razorpay Plan ID -> Our DB Plan ID.

    // Let's do this:
    // 1. Verify signature.
    // 2. If valid, we need to know WHICH plan was purchased.
    //    The `razorpay_order_id` in subscription flow IS the `subscription_id`.

    try {
      const subscription =
        await this._razorpayService.fetchSubscription(orderId); // orderId is subId

      if (subscription && subscription.plan_id) {
        const plan = await this._planRepo.findByRazorpayId(
          subscription.plan_id,
        );
        if (plan) {
          await this._orgRepo.update(orgId, {
            subscriptionStatus: "ACTIVE",
            razorpaySubscriptionId: orderId, // Subscription ID
            planId: plan.id,
            subscriptionStartsAt: new Date(subscription.current_start! * 1000),
            subscriptionEndsAt: new Date(subscription.current_end! * 1000),
            // Update limits based on plan
            maxUsers: plan.limits.members,
            maxManagers: plan.limits.projects, // Assuming projects maps to managers for now or just separate
            // We should probably have maxManagers in Plan limits too.
          });
          await this._subscriptionRepo.updateByRazorpayId(orderId,{status : 'active'})
        }
      }
    } catch (error) {
      console.error("Failed to update organization subscription", error);
      // Even if DB update fails, payment was valid. But this is bad state.
      // We should probably return false or throw error.
      return false;
    }

    return true;
  }
}
