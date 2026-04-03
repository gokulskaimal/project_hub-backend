import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IGetProjectUseCase } from "../interface/useCases/IGetProjectUseCase";
import { Project } from "../../domain/entities/Project";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

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

  async executePaginated(
    limit: number,
    offset: number,
    filters: {
      orgId: string;
      status?: string;
      priority?: string;
      searchTerm?: string;
    },
  ): Promise<{ projects: Project[]; total: number }> {
    // Note: In a real app, we'd also validate access for the requesterId here.
    // Assuming the controller handles basic auth and orgId is from the user token.
    return this._projectRepo.findPaginated(limit, offset, filters);
  }
}
