import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGetTaskUseCase } from "../interface/useCases/IGetTaskUseCase";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ISecurityService } from "../../infrastructure/interface/services/ISecurityService";

@injectable()
export class GetTaskUseCase implements IGetTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(projectId: string, requesterId: string): Promise<Task[]> {
    await this._securityService.validateProjectAccess(requesterId, projectId);
    const tasks = await this._taskRepo.findByProject(projectId);
    if (!tasks) throw new EntityNotFoundError("Tasks Not Found", projectId);
    return tasks;
  }
}
