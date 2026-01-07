import { injectable, inject } from "inversify";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IGetMemberTasksUseCase } from "../interface/useCases/IGetMemberTasksUseCase";
import { Task } from "../../domain/entities/Task";
import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()
export class GetMemberTasksUseCase implements IGetMemberTasksUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(userId: string): Promise<Task[]> {
    this._logger.info(`Fetching tasks for user: ${userId}`);
    return this._taskRepo.findByAssignee(userId);
  }
}
