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
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
  ) {}

  async execute(
    orderId: string,
    paymentId: string,
    signature: string,
    orgId: string,
  ): Promise<boolean> {
    try {
      // 1. Verify Signature
      const isValid = this._razorpayService.verifySignature(
        orderId,
        paymentId,
        signature,
      );

      if (!isValid) return false;

      // 2. Identify Plan & Update
      // Since we now create Orders, 'orderId' is a Razorpay Order ID (starting with order_).
      // We stored this orderId in the 'Subscription' table under 'razorpaySubscriptionId' field.

      // Find the local subscription record using the Order ID
      const localSub =
        await this._subscriptionRepo.findByRazorpaySubscriptionId(orderId);

      if (localSub) {
        const plan = await this._planRepo.findById(localSub.planId);

        if (plan) {
          // Update Organization
          await this._orgRepo.update(orgId, {
            subscriptionStatus: "ACTIVE",
            razorpaySubscriptionId: orderId, // It's an Order ID now, but we store it here
            planId: plan.id,
            subscriptionStartsAt: new Date(),
            subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default for now
            // Update limits based on plan
            maxUsers: plan.limits.members,
            maxManagers: plan.limits.projects,
          });

          // Update Subscription Status
          await this._subscriptionRepo.update(localSub.id, {
            status: "active",
          });
        }
      } else {
        // Fallback for legacy subscriptions or direct Razorpay subscription flow (if any)
        // This block preserves the old logic just in case, or we can just log error.
        // For this refactor, let's assume we rely on local DB record.
        console.warn("Local subscription record not found for order:", orderId);
        // We could try fetching from Razorpay if it was a real Subscription, but we are moving away from it.
      }
    } catch (error) {
      console.error("Failed to verify payment and update subscription", error);
      return false;
    }

    return true;
  }
}
