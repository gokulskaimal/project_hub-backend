import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { IDeletePlanUseCase } from "../interface/useCases/IDeletePlanUseCase";

@injectable()
export class DeletePlanUseCase implements IDeletePlanUseCase {
  constructor(@inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo) {}

  async execute(id: string): Promise<boolean> {
    return this._planRepo.delete(id);
  }
}
