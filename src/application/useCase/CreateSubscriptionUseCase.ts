import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import {
  IRazorpayService,
  RazorpaySubscription,
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
  async execute(userId: string, planId: string): Promise<RazorpaySubscription> {
    const plan = await this._planRepo.findById(planId);
    if (!plan || !plan.razorpayPlanId) {
      throw new EntityNotFoundError("Plan", planId);
    }
    if (userId !== "super_admin") {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new EntityNotFoundError("User", userId);
      }
    }

    // Create Subscription in Razorpay
    // Razorpay requires total_count. We can set a high number for recurring.
    let subscription: RazorpaySubscription;

    if (plan.razorpayPlanId.startsWith("plan_free_")) {

      const newSeconds = Math.floor(Date.now()/1000)
      subscription = {
        id: `sub_free_${Date.now()}`,
        entity: "subscription",
        plan_id: plan.razorpayPlanId,
        status: "active",
        current_start: newSeconds,
        current_end: newSeconds + 30 * 24 * 60 * 60, // 30 days
        ended_at: undefined,
        quantity: 1,
        notes: {},
        charge_at: newSeconds,
        start_at: newSeconds,
        end_at: newSeconds + 30 * 24 * 60 * 60,
        auth_attempts: 0,
        total_count: 120,
        paid_count: 0,
        customer_notify: true,
        created_at: newSeconds,
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



    if(userId !== "super_admin"){
      const existing = await this._subscriptionRepo.findByUserId(userId)

      const subData = {
        userId : userId,
        planId : planId,
        razorpaySubscriptionId : subscription.id,
        razorpayCustomerId : "cust_placeholder",
        status : subscription.status as Subscription['status'],
        currentPeriodStart : new Date((subscription.current_start ?? Math.floor(Date.now()/1000)) * 1000),
        currentPeriodEnd : new Date((subscription.current_end ?? Math.floor(Date.now()/1000)) * 1000),
        cancelAtPeriodEnd : false,
      }
      if(existing){
        await this._subscriptionRepo.update(existing.id, subData)
      }else{
        await this._subscriptionRepo.create(subData)
      }
    }

    return subscription;
  }
}

