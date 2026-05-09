import { Plan } from "../../../domain/entities/Plan";

export interface ICreatePlanUseCase {
  execute(
    planData: Omit<Plan, "id" | "createdAt" | "updatedAt" | "razorpayPlanId">,
    requesterId: string,
  ): Promise<Plan>;
}
