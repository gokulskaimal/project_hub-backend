import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetTaskHistoryUseCase } from "../interface/useCases/IGetTaskHistoryUseCase";
import { ITaskHistoryRepo } from "../../infrastructure/interface/repositories/ITaskHistoryRepo";
import { TaskHistory } from "../../domain/entities/TaskHistory";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";

@injectable()
export class GetTaskHistoryUseCase implements IGetTaskHistoryUseCase {
  constructor(
    @inject(TYPES.ITaskHistoryRepo) private _historyRepo: ITaskHistoryRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(taskId: string, requesterId: string): Promise<TaskHistory[]> {
    const task = await this._taskRepo.findById(taskId);
    if (!task) throw new EntityNotFoundError("Task", taskId);

    // Validate access via project
    await this._securityService.validateProjectAccess(
      requesterId,
      task.projectId,
    );

    return this._historyRepo.findByTaskId(taskId);
  }
}
