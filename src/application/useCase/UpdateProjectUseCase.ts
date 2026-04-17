import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IUpdateProjectUseCase } from "../interface/useCases/IUpdateProjectUseCase";
import { Project } from "../../domain/entities/Project";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { ILogger } from "../../application/interface/services/ILogger";
import { IEventDispatcher } from "../interface/services/IEventDispatcher";
import { PROJECT_EVENTS } from "../events/ProjectEvents";

@injectable()
export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
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
    const oldProject = await this._projectRepo.findById(id);

    if (!oldProject) {
      this._logger.warn(`Update failed: Project ${id} not found`);
      throw new EntityNotFoundError("Project Not Found", id);
    }

    // RBAC Check
    await this._securityService.validateOrgManager(
      requesterId,
      oldProject.orgId,
    );

    // [SCURM] Domain Rule: Immutability (Completed projects are locked)
    if (oldProject.status === "COMPLETED") {
      try {
        await this._securityService.validateSuperAdmin(requesterId);
      } catch {
        throw new Error(
          "Completed projects are locked and cannot be modified.",
        );
      }
    }

    // Validate that all new team members belong to this organization
    if (data.teamMemberIds && data.teamMemberIds.length > 0) {
      await this._securityService.validateMembersBelongToOrg(
        data.teamMemberIds,
        oldProject.orgId,
      );
    }

    this._logger.info(`Updating project ${id}`);
    const updated = await this._projectRepo.update(id, data);
    if (!updated) {
      throw new EntityNotFoundError("Project Not Found", id);
    }

    // DISPATCH EVENT
    this._eventDispatcher.dispatch(PROJECT_EVENTS.UPDATED, {
      oldProject,
      updatedProject: updated,
      updaterId: requesterId,
      changes: data,
    });

    return updated;
  }
}
