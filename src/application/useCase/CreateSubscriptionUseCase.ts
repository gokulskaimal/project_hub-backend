import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import {
  IRazorpayService,
  RazorpaySubscription,
} from "../../infrastructure/interface/services/IRazorpayService";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { ISubscriptionRepo } from "../../infrastructure/interface/repositories/ISubscriptionRepo";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { HttpError } from "../../utils/asyncHandler";
import { ICreateSubscriptionUseCase } from "../interface/useCases/ICreateSubscriptionUseCase";

@injectable()
export class CreateSubscriptionUseCase implements ICreateSubscriptionUseCase {
  constructor(
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISubscriptionRepo)
    private _subscriptionRepo: ISubscriptionRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
  ) {}
  async execute(userId: string, planId: string): Promise<RazorpaySubscription> {
    const plan = await this._planRepo.findById(planId);
    if (!plan || !plan.razorpayPlanId) {
      throw new HttpError(StatusCodes.NOT_FOUND, "Plan not found or invalid");
    }
    if (userId !== "super_admin") {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new HttpError(StatusCodes.NOT_FOUND, "User not found");
      }
    }

    // Create Subscription in Razorpay
    // Razorpay requires total_count. We can set a high number for recurring.
    let subscription: RazorpaySubscription;

    if (plan.razorpayPlanId.startsWith("plan_free_")) {
      subscription = {
        id: `sub_free_${Date.now()}`,
        entity: "subscription",
        plan_id: plan.razorpayPlanId,
        status: "active",
        current_start: Math.floor(Date.now() / 1000),
        current_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
        ended_at: undefined,
        quantity: 1,
        notes: {},
        charge_at: Math.floor(Date.now() / 1000),
        start_at: Math.floor(Date.now() / 1000),
        end_at: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        auth_attempts: 0,
        total_count: 120,
        paid_count: 0,
        customer_notify: true,
        created_at: Math.floor(Date.now() / 1000),
        expire_by: undefined,
        short_url: "",
        has_scheduled_changes: false,
        change_scheduled_at: undefined,
        source: "api",
      };
    } else {
      subscription = await this._razorpayService.createSubscription(
        plan.razorpayPlanId,
        120, // 10 years monthly
      );
    }

    return subscription;
  }
}
