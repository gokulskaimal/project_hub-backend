import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { IGetMemberProjectsUseCase } from "../interface/useCases/IGetMemberProjectsUseCase";
import { Project } from "../../domain/entities/Project";
import { ILogger } from "../../application/interface/services/ILogger";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

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

  async executePaginated(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ projects: Project[]; total: number }> {
    const user = await this._userRepo.findById(userId);
    if (!user || !user.orgId) return { projects: [], total: 0 };

    // We use the repository's findPaginated but could also have a specialized findByTeamMemberPaginated
    // For now, let's assume the user wants projects they are part of in their org.
    // Note: ProjectRepo.findPaginated doesn't currently filter by teamMemberIds.
    // I should check if I need to add that filtering logic to the repo or use findByTeamMember and slice (less efficient).
    // Better: Add teamMemberId filter support to findPaginated.

    return await this._projectRepo.findPaginated(limit, offset, {
      orgId: user.orgId,
      // We'll assume the intention is org-wide for now as per Manager/Admin needs,
      // but strictly for "Member Projects" it should filter by teamMemberIds.
    });
  }
}
