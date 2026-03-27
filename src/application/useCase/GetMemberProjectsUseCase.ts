import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { IGetMemberProjectsUseCase } from "../interface/useCases/IGetMemberProjectsUseCase";
import { Project } from "../../domain/entities/Project";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";

@injectable()
export class GetMemberProjectsUseCase implements IGetMemberProjectsUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(userId: string, requesterId: string): Promise<Project[]> {
    const user = await this._userRepo.findById(userId);
    if (!user) return [];

    this._logger.info(
      `Fetching projects for team member: ${userId} in org: ${user.orgId} (Requested by: ${requesterId})`,
    );

    if (!user.orgId) return [];

    // Validate requester belongs to the same org as the target user
    await this._securityService.validateOrgAccess(requesterId, user.orgId);

    return await this._projectRepo.findByTeamMember(userId, user.orgId);
  }
}
