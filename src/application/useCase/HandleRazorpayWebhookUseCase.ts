import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IHandleRazorpayWebhookUseCase } from "../interface/useCases/IHandleRazorpayWebhookUseCase";
import { ISubscriptionRepo } from "../interface/repositories/ISubscriptionRepo";
import { IUserRepo } from "../interface/repositories/IUserRepo";
import { IOrgRepo } from "../interface/repositories/IOrgRepo";
import { ILogger } from "../interface/services/ILogger";
import { RazorpaySubscription } from "../interface/services/IRazorpayService";

@injectable()
export class HandleRazorpayWebhookUseCase implements IHandleRazorpayWebhookUseCase {
  constructor(
    @inject(TYPES.ISubscriptionRepo) private _subRepo: ISubscriptionRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(
    event: string,
    subscription: RazorpaySubscription,
  ): Promise<void> {
    this._logger.info(
      `Processing Webhook Event: ${event} for ID: ${subscription.id}`,
    );

    switch (event) {
      case "subscription.charged":
        await this._handleSubscriptionCharged(subscription);
        break;
      case "subscription.cancelled":
        await this._handleSubscriptionCancelled(subscription);
        break;
      case "subscription.halted":
        await this._handleSubscriptionHalted(subscription);
        break;
      default:
        this._logger.warn(`Unhandled Razorpay event type: ${event}`);
        break;
    }
  }

  private async _handleSubscriptionCharged(
    subscription: RazorpaySubscription,
  ): Promise<void> {
    const currentStart = subscription.current_start
      ? new Date(subscription.current_start * 1000)
      : new Date();
    const currentEnd = subscription.current_end
      ? new Date(subscription.current_end * 1000)
      : new Date();

    const localSub = await this._subRepo.updateByRazorpayId(subscription.id, {
      status: "active",
      currentPeriodStart: currentStart,
      currentPeriodEnd: currentEnd,
    });

    if (localSub) {
      const user = await this._userRepo.findById(localSub.userId);
      if (user?.orgId) {
        await this._orgRepo.update(user.orgId, {
          subscriptionStatus: "ACTIVE",
          subscriptionStartsAt: currentStart,
          subscriptionEndsAt: currentEnd,
        });
        this._logger.info(`Synchronized Org ${user.orgId} to ACTIVE.`);
      }
    }
  }

  private async _handleSubscriptionCancelled(
    subscription: RazorpaySubscription,
  ): Promise<void> {
    const currentEnd = subscription.current_end
      ? new Date(subscription.current_end * 1000)
      : new Date();
    const isPeriodEndinFuture = currentEnd.getTime() > Date.now();
    const localSub = await this._subRepo.updateByRazorpayId(subscription.id, {
      status: "canceled",
      cancelAtPeriodEnd: isPeriodEndinFuture,
    });

    if (localSub) {
      const user = await this._userRepo.findById(localSub.userId);
      if (user?.orgId) {
        if (!isPeriodEndinFuture) {
          // Billing cycle is over — revoke access immediately
          await this._orgRepo.update(user.orgId, {
            subscriptionStatus: "CANCELLED",
          });
          this._logger.info(
            `Org ${user.orgId} access REVOKED — subscription cancelled, billing period ended.`,
          );
        } else {
          // User paid for this period — retain access until it ends naturally
          this._logger.info(
            `Org ${user.orgId} subscription cancelled but retaining ACTIVE access until period end (${currentEnd.toISOString()}).`,
          );
        }
      }
    }
  }

  private async _handleSubscriptionHalted(
    subscription: RazorpaySubscription,
  ): Promise<void> {
    // Razorpay fires "halted" after exhausting all payment retry attempts
    const localSub = await this._subRepo.updateByRazorpayId(subscription.id, {
      status: "halted",
    });

    if (localSub) {
      const user = await this._userRepo.findById(localSub.userId);
      if (user?.orgId) {
        await this._orgRepo.update(user.orgId, {
          subscriptionStatus: "SUSPENDED",
        });
        this._logger.warn(
          `Org ${user.orgId} SUSPENDED due to payment failure (subscription halted).`,
        );
      }
    }
  }
}
