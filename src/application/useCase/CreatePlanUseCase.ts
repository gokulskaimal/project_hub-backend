import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { IRazorpayService } from "../../application/interface/services/IRazorpayService";
import { Plan } from "../../domain/entities/Plan";
import { ICreatePlanUseCase } from "../interface/useCases/ICreatePlanUseCase";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class CreatePlanUseCase implements ICreatePlanUseCase {
  constructor(
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.IRazorpayService) private _razorpayService: IRazorpayService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    planData: Omit<Plan, "id" | "createdAt" | "updatedAt" | "razorpayPlanId">,
    requesterId: string,
  ): Promise<Plan> {
    await this._securityService.validateSuperAdmin(requesterId);
    // Create Plan in Razorpay
    // Razorpay createPlan signature: (name, description, amount, currency, period, interval)
    // Assuming period is 'monthly' and interval is 1 based on current logic, or derived from planData
    let razorpayPlanId = "";
    if (planData.price > 0) {
      razorpayPlanId = await this._razorpayService.createPlan(
        planData.name,
        planData.description || "",
        planData.price,
        planData.currency,
        "monthly", // Defaulting to monthly for now, should be dynamic if Plan has interval
        1,
      );
    } else {
      razorpayPlanId = `plan_free_${Date.now()}`;
    }

    const newPlan = await this._planRepo.create({
      ...planData,
      razorpayPlanId,
    } as Plan);
    return newPlan;
  }
}
