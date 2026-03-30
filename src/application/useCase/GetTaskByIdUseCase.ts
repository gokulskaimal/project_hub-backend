import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetTaskByIdUseCase } from "../interface/useCases/IGetTaskUseCase";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class GetTaskByIdUseCase implements IGetTaskByIdUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(id: string, requesterId: string): Promise<Task> {
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task", id);

    // Validate access via project
    await this._securityService.validateProjectAccess(
      requesterId,
      task.projectId,
    );

    return task;
  }
}
