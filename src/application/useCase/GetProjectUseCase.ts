import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IGetProjectUseCase } from "../interface/useCases/IGetProjectUseCase";
import { Project } from "../../domain/entities/Project";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";

@injectable()
export class GetProjectUseCase implements IGetProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(orgId: string, requesterId: string): Promise<Project[]> {
    await this._securityService.validateOrgAccess(requesterId, orgId);
    return this._projectRepo.findByOrg(orgId);
  }
}
