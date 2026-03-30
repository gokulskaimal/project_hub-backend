import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { Plan } from "../../domain/entities/Plan";
import { IUpdatePlanUseCase } from "../interface/useCases/IUpdatePlanUseCase";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class UpdatePlanUseCase implements IUpdatePlanUseCase {
  constructor(
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    id: string,
    planData: Partial<Plan>,
    requesterId: string,
  ): Promise<Plan | null> {
    await this._securityService.validateSuperAdmin(requesterId);
    return this._planRepo.update(id, planData);
  }
}
