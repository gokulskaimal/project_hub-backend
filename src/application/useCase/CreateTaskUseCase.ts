import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { ICreateTaskUseCase } from "../interface/useCases/ICreateTaskUseCase";
import { Task } from "../../domain/entities/Task";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";

import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";

@injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async execute(data: Partial<Task>): Promise<Task> {
    if (!data.projectId) throw new ValidationError("Project Id is required");
    const project = await this._projectRepo.findById(data.projectId);
    if (!project)
      throw new EntityNotFoundError("Project Not Found", data.projectId);
    if (project.orgId !== data.orgId)
      throw new ValidationError("Project does not belong to this organization");
    if (project.orgId !== data.orgId)
      throw new ValidationError("Project does not belong to this organization");

    this._logger.info(
      `Creating task '${data.title}' in project ${data.projectId}`,
    );
    const newTask = await this._taskRepo.create(data);

    // Notify organization about the new task
    this._socketService.emitToOrganization(
      data.orgId!,
      "task:created",
      newTask,
    );

    return newTask;
  }
}
