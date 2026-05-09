import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetTaskUseCase } from "../interface/useCases/IGetTaskUseCase";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class GetTaskUseCase implements IGetTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    projectId: string,
    requesterId: string,
    filters?: {
      epicId?: string;
      parentTaskId?: string;
      isInBacklog?: boolean;
      type?: string;
    },
  ): Promise<Task[]> {
    await this._securityService.validateProjectAccess(requesterId, projectId);
    const tasks = await this._taskRepo.findAllByProject(projectId, filters);
    if (!tasks) throw new EntityNotFoundError("Tasks Not Found", projectId);
    return tasks;
  }

  async executePaginated(
    projectId: string,
    requesterId: string,
    limit: number,
    offset: number,
    filters?: {
      epicId?: string;
      parentTaskId?: string;
      isInBacklog?: boolean;
      type?: string;
    },
  ): Promise<{ tasks: Task[]; total: number }> {
    await this._securityService.validateProjectAccess(requesterId, projectId);
    const tasks = await this._taskRepo.findPaginatedByProject(
      projectId,
      limit,
      offset,
      filters,
    );
    const total = await this._taskRepo.countByProject(projectId, filters);
    return { tasks, total };
  }
}
