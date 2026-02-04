import { injectable, inject } from "inversify";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IUpdateProjectUseCase } from "../interface/useCases/IUpdateProjectUseCase";
import { Project } from "../../domain/entities/Project";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";

import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()
export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async execute(id: string, data: Partial<Project>): Promise<Project> {
    const project = await this._projectRepo.findById(id);

    if (!project) {
      this._logger.warn(`Update failed: Project ${id} not found`);
      throw new EntityNotFoundError("Project Not Found", id);
    }
    this._logger.info(`Updating project ${id}`);
    const updated = await this._projectRepo.update(id, data);
    if (!updated) {
      throw new EntityNotFoundError("Project Not Found", id);
    }

    // [NEW] Emit Real-time Update
    if (updated.orgId) {
      this._socketService.emitToOrganization(
        updated.orgId,
        "project:updated",
        updated,
      );
    }

    return updated;
  }
}
