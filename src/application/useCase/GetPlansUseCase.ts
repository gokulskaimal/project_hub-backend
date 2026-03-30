import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { Plan } from "../../domain/entities/Plan";
import { IGetPlanUseCase } from "../interface/useCases/IGetPlanUseCase";

@injectable()
export class GetPlansUseCase implements IGetPlanUseCase {
  constructor(@inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo) {}

  async execute(filter?: Partial<Plan>): Promise<Plan[]> {
    return this._planRepo.findAll(filter);
  }
}
