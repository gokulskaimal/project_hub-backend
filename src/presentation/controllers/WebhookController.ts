import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import {
  IRazorpayService,
  RazorpaySubscription,
} from "../../application/interface/services/IRazorpayService";
import { ISubscriptionRepo } from "../../application/interface/repositories/ISubscriptionRepo";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { asyncHandler } from "../../utils/asyncHandler";
import crypto from "crypto";
import { ILogger } from "../../application/interface/services/ILogger";
import { AppConfig } from "../../config/AppConfig";

@injectable()
export class WebhookController {
  constructor(
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.AppConfig) private config: AppConfig,
  ) {}

  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const secret = this.config.razorpay.webhookSecret;
    if (!secret) {
      throw new Error("RAZORPAY_WEBHOOK_SECRET is not defined");
    }

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      this.logger.warn("Invalid Razorpay Webhook Signature");
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
    this.logger.info(`Received Webhook Event: ${event.event}`);

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
        this.logger.warn(`Unhandled event type ${event.event}`);
    }

    res.status(StatusCodes.OK).json({ received: true });
  });

  private async _handleSubscriptionCharged(
    subscription: RazorpaySubscription,
  ): Promise<void> {
    const currentStart = subscription.current_start
      ? new Date(subscription.current_start * 1000)
      : new Date();

    const currentEnd = subscription.current_end
      ? new Date(subscription.current_end * 1000)
      : new Date();

    const localSub = await this._subscriptionRepo.updateByRazorpayId(
      subscription.id,
      {
        status: "active",
        currentPeriodStart: currentStart,
        currentPeriodEnd: currentEnd,
      },
    );

    // ✨ CRITICAL FIX: Synchronize with Organization Record
    if (localSub) {
      const user = await this._userRepo.findById(localSub.userId);
      if (user && user.orgId) {
        await this._orgRepo.update(user.orgId, {
          subscriptionStatus: "ACTIVE",
          subscriptionStartsAt: currentStart,
          subscriptionEndsAt: currentEnd,
        });
        this.logger.info(
          `Successfully synchronized Organization ${user.orgId} subscription to ACTIVE.`,
        );
      }
    } else {
      this.logger.warn(
        `Local subscription not found for charged razorpay ID: ${subscription.id}`,
      );
    }
  }

  private async _handleSubscriptionCancelled(
    subscription: RazorpaySubscription,
  ): Promise<void> {
    const localSub = await this._subscriptionRepo.updateByRazorpayId(
      subscription.id,
      {
        status: "canceled",
        cancelAtPeriodEnd: false,
      },
    );

    //Remove Access from Organization
    if (localSub) {
      const user = await this._userRepo.findById(localSub.userId);
      if (user && user.orgId) {
        await this._orgRepo.update(user.orgId, {
          subscriptionStatus: "CANCELLED",
        });
        this.logger.info(
          `Successfully downgraded Organization ${user.orgId} subscription to CANCELLED.`,
        );
      }
    } else {
      this.logger.warn(
        `Local subscription not found for cancelled razorpay ID: ${subscription.id}`,
      );
    }
  }
}
