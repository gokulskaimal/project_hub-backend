import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { Plan } from "../../domain/entities/Plan";
import { IUpdatePlanUseCase } from "../interface/useCases/IUpdatePlanUseCase";

@injectable()
export class UpdatePlanUseCase implements IUpdatePlanUseCase {
  constructor(@inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo) {}

  async execute(id: string, planData: Partial<Plan>): Promise<Plan | null> {
    return this._planRepo.update(id, planData);
  }
}
