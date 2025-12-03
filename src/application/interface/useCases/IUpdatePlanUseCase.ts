import { Plan } from "../../../domain/entities/Plan";

export interface IUpdatePlanUseCase {
  execute(id: string, planData: Partial<Plan>): Promise<Plan | null>;
}
