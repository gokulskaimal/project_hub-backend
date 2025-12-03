import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import {
  IRazorpayService,
  RazorpaySubscription,
} from "../../infrastructure/interface/services/IRazorpayService";
import { ISubscriptionRepo } from "../../infrastructure/interface/repositories/ISubscriptionRepo";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { asyncHandler } from "../../utils/asyncHandler";
import crypto from "crypto";

@injectable()
export class WebhookController {
  constructor(
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
  ) {}

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("RAZORPAY_WEBHOOK_SECRET is not defined");
    }

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid signature" });
      return;
    }

    interface WebhookEvent {
      event: string;
      payload: {
        subscription: {
          entity: RazorpaySubscription;
        };
      };
    }

    const event = req.body as WebhookEvent;

    switch (event.event) {
      case "subscription.charged":
        await this._handleSubscriptionCharged(
          event.payload.subscription.entity,
        );
        break;
      case "subscription.cancelled":
        await this._handleSubscriptionCancelled(
          event.payload.subscription.entity,
        );
        break;
      default:
        console.log(`Unhandled event type ${event.event}`);
    }

    res.status(StatusCodes.OK).json({ received: true });
  });

  private async _handleSubscriptionCharged(
    subscription: RazorpaySubscription,
  ): Promise<void> {
    // Logic to update subscription status to active and update dates
    // Razorpay subscription entity has current_start and current_end timestamps
    await this._subscriptionRepo.updateByRazorpayId(subscription.id, {
      status: "active",
      currentPeriodStart: subscription.current_start
        ? new Date(subscription.current_start * 1000)
        : new Date(),
      currentPeriodEnd: subscription.current_end
        ? new Date(subscription.current_end * 1000)
        : new Date(),
      // ... other fields
    });
  }

  private async _handleSubscriptionCancelled(
    subscription: RazorpaySubscription,
  ): Promise<void> {
    await this._subscriptionRepo.updateByRazorpayId(subscription.id, {
      status: "canceled",
      cancelAtPeriodEnd: false, // Immediate cancellation usually
    });
  }
}
