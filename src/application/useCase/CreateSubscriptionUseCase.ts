import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import {
  IRazorpayService,
  RazorpayOrder,
} from "../../infrastructure/interface/services/IRazorpayService";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../../infrastructure/interface/repositories/ISubscriptionRepo";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { ICreateSubscriptionUseCase } from "../interface/useCases/ICreateSubscriptionUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { Subscription } from "../../domain/entities/Subscription";

@injectable()
export class CreateSubscriptionUseCase implements ICreateSubscriptionUseCase {
  constructor(
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
  ) {}
  async execute(userId: string, planId: string): Promise<RazorpayOrder> {
    const plan = await this._planRepo.findById(planId);
    if (!plan) {
      throw new EntityNotFoundError("Plan", planId);
    }
    if (userId !== "super_admin") {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new EntityNotFoundError("User", userId);
      }
    }

    // Amount needs to be in defaults (INR usually requires paise, but service handles * 100)
    // Actually looking at RazorpayService.createOrder, it does Math.round(amount * 100).
    // So we pass plan.price directly.

    let order: RazorpayOrder;

    // Handle Free Plans or Mock logic
    if (plan.razorpayPlanId.startsWith("plan_free_")) {
      order = {
        id: `order_free_${Date.now()}`,
        amount: 0,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        status: "created",
        created_at: Math.floor(Date.now() / 1000),
      };
    } else {
      // Create Razorpay Order
      order = await this._razorpayService.createOrder(
        plan.price,
        plan.currency || "INR",
        `rcpt_${Date.now()}_${userId.slice(-4)}`,
      );
    }

    if (userId !== "super_admin") {
      const existing = await this._subscriptionRepo.findByUserId(userId);

      const subData = {
        userId: userId,
        planId: planId,
        razorpaySubscriptionId: order.id, // storing order_id here
        razorpayCustomerId: "cust_placeholder",
        status: "created" as Subscription["status"], // Initial status
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days, updated on verify
        cancelAtPeriodEnd: false,
      };

      if (existing) {
        await this._subscriptionRepo.update(existing.id, subData);
      } else {
        await this._subscriptionRepo.create(subData);
      }
    }

    return order;
  }
}
