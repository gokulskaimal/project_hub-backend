import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../interface/repositories/IProjectRepo";
import { IUserRepo } from "../interface/repositories/IUserRepo";
import { ISecurityService } from "../interface/services/ISecurityService";
import { IGetProjectMembersUseCase } from "../interface/useCases/IGetProjectMembersUseCase";
import { User } from "../../domain/entities/User";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

@injectable()
export class GetProjectMembersUseCase implements IGetProjectMembersUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private readonly _projectRepo: IProjectRepo,
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ISecurityService)
    private readonly _securityService: ISecurityService,
  ) {}

  async execute(projectId: string, requesterId: string): Promise<User[]> {
    const project = await this._projectRepo.findById(projectId);
    if (!project) {
      throw new EntityNotFoundError("Project not found");
    }

    // Valdidate that the requester has access to the project
    await this._securityService.validateProjectAccess(requesterId, projectId);

    const memberIds = project.teamMemberIds || [];
    if (memberIds.length === 0) {
      return [];
    }

    return this._userRepo.findByIds(memberIds);
  }
}
