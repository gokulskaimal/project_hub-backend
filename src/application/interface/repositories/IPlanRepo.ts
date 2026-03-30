import { Plan } from "../../../domain/entities/Plan";

export interface IPlanRepo {
  create(plan: Plan): Promise<Plan>;
  findAll(filter?: Partial<Plan>): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  update(id: string, plan: Partial<Plan>): Promise<Plan | null>;
  delete(id: string): Promise<boolean>;
  findByRazorpayId(razorpayPlanId: string): Promise<Plan | null>;
}
