import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { IDeleteProjectUseCase } from "../interface/useCases/IDeleteProjectUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../application/interface/services/ILogger";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { IChatRepo } from "../../application/interface/repositories/IChatRepo";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class DeleteProjectUseCase implements IDeleteProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ITaskHistoryRepo) private _taskHistoryRepo: ITaskHistoryRepo,
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(id: string, requesterId: string): Promise<boolean> {
    this._logger.info(
      `Deleting project ${id} and all related data by user ${requesterId}`,
    );

    const project = await this._projectRepo.findById(id);
    if (!project) throw new EntityNotFoundError("Project", id);

    // RBAC Check
    await this._securityService.validateOrgManager(requesterId, project.orgId);

    const tasks = await this._taskRepo.findByProject(id);
    if (tasks.length > 0) {
      this._logger.info(`Deleting ${tasks.length} tasks for project ${id}`);
      await Promise.all(
        tasks.map(async (t) => {
          await this._taskRepo.deleteSubtasks(t.id);
          await this._taskHistoryRepo.deleteByTaskId(t.id);
          await this._taskRepo.delete(t.id);
        }),
      );
    }

    const sprints = await this._sprintRepo.findByProject(id);
    if (sprints.length > 0) {
      this._logger.info(`Deleting ${sprints.length} sprints for project ${id}`);
      await Promise.all(sprints.map((s) => this._sprintRepo.delete(s.id)));
    }

    this._logger.info(`Deleting all chat messages for project ${id}`);
    await this._chatRepo.deleteByProject(id);

    const success = await this._projectRepo.delete(id);
    if (!success) throw new EntityNotFoundError("Project", id);

    return true;
  }
}
