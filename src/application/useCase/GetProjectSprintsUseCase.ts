import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISprintRepo } from "../../infrastructure/interface/repositories/ISprintRepo";
import { Sprint } from "../../domain/entities/Sprint";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IGetProjectSprintsUseCase } from "../interface/useCases/IGetProjectSprintsUseCase";

@injectable()
export class GetProjectSprintsUseCase implements IGetProjectSprintsUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(projectId: string): Promise<Sprint[]> {
    this._logger.info(`Fetching sprints for project ${projectId}`);
    return await this._sprintRepo.findByProject(projectId);
  }
}
