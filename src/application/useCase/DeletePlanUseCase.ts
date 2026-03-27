import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IPlanRepo } from "../../infrastructure/interface/repositories/IPlanRepo";
import { IDeletePlanUseCase } from "../interface/useCases/IDeletePlanUseCase";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";

@injectable()
export class DeletePlanUseCase implements IDeletePlanUseCase {
  constructor(
    @inject(TYPES.IPlanRepo) private _planRepo: IPlanRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(id: string, requesterId: string): Promise<boolean> {
    await this._securityService.validateSuperAdmin(requesterId);
    return this._planRepo.delete(id);
  }
}
