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
    const subscription = await this._razorpayService.createSubscription(
      plan.razorpayPlanId,
      120, // 10 years monthly
    );

    return subscription;
  }
}
