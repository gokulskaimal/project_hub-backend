import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISprintRepo } from "../../infrastructure/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IDeleteSprintUseCase } from "../interface/useCases/IDeleteSprintUseCase";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";

@injectable()
export class DeleteSprintUseCase implements IDeleteSprintUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(id: string, requesterId: string): Promise<boolean> {
    this._logger.info(`Deleting sprint ${id} by user ${requesterId}`);

    const sprint = await this._sprintRepo.findById(id);
    if (!sprint) {
      throw new EntityNotFoundError("Sprint", id);
    }

    // RBAC Check
    const project = await this._projectRepo.findById(sprint.projectId);
    if (!project) throw new EntityNotFoundError("Project", sprint.projectId);
    await this._securityService.validateOrgManager(requesterId, project.orgId);

    // Unassign tasks mapped to this sprint
    const tasks = await this._taskRepo.findAll({ sprintId: id });
    await Promise.all(
      tasks.map((t) => this._taskRepo.update(t.id, { sprintId: null })),
    );

    await this._sprintRepo.delete(id);
    return true;
  }
}
