import { injectable, inject } from "inversify";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { TYPES } from "../../infrastructure/container/types";
import { IGetOrgTasksUseCase } from "../interface/useCases/IGetOrgTasksUseCase";
import { Task } from "../../domain/entities/Task";
import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()
export class GetOrgTasksUseCase implements IGetOrgTasksUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(orgId: string): Promise<Task[]> {
    this._logger.info(`Fetching tasks for organization: ${orgId}`);
    return this._taskRepo.findByOrganization(orgId);
  }
}
