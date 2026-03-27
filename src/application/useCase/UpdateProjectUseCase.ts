import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IUpdateProjectUseCase } from "../interface/useCases/IUpdateProjectUseCase";
import { Project } from "../../domain/entities/Project";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import { IAuthValidationService } from "../../infrastructure/interface/services/IAuthValidationService";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()
export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.IAuthValidationService)
    private _authValidationService: IAuthValidationService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    id: string,
    data: Partial<Project>,
    requesterId: string,
  ): Promise<Project> {
    if (data.name) {
      this._authValidationService.validateProjectName(data.name);
    }
    const project = await this._projectRepo.findById(id);

    if (!project) {
      this._logger.warn(`Update failed: Project ${id} not found`);
      throw new EntityNotFoundError("Project Not Found", id);
    }

    // RBAC Check
    await this._securityService.validateOrgManager(requesterId, project.orgId);

    // Validate that all new team members belong to this organization
    if (data.teamMemberIds && data.teamMemberIds.length > 0) {
      await this._securityService.validateMembersBelongToOrg(
        data.teamMemberIds,
        project.orgId,
      );
    }

    this._logger.info(`Updating project ${id}`);
    const updated = await this._projectRepo.update(id, data);
    if (!updated) {
      throw new EntityNotFoundError("Project Not Found", id);
    }

    // [NEW] Emit Real-time Update (Targeted at Managers)
    if (updated.orgId) {
      this._socketService.emitToRoleInOrg(
        updated.orgId,
        "ORG MANAGER",
        "project:updated",
        updated,
      );
    }

    return updated;
  }
}
