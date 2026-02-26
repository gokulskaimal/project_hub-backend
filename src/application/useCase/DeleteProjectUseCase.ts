import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { IDeleteProjectUseCase } from "../interface/useCases/IDeleteProjectUseCase";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ISprintRepo } from "../../infrastructure/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IChatRepo } from "../../infrastructure/interface/repositories/IChatRepo";

@injectable()
export class DeleteProjectUseCase implements IDeleteProjectUseCase {
  constructor(
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IChatRepo) private _chatRepo: IChatRepo,
  ) {}

  async execute(id: string): Promise<boolean> {
    this._logger.info(`Deleting project ${id} and all related data`);

    const project = await this._projectRepo.findById(id);
    if (!project) throw new EntityNotFoundError("Project", id);

    const tasks = await this._taskRepo.findByProject(id);
    if (tasks.length > 0) {
      this._logger.info(`Deleting ${tasks.length} tasks for project ${id}`);
      await Promise.all(tasks.map((t) => this._taskRepo.delete(t.id)));
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
