import { Plan } from "../../../domain/entities/Plan";

export interface IGetPlanUseCase {
  execute(filter?: Partial<Plan>): Promise<Plan[]>;
}
