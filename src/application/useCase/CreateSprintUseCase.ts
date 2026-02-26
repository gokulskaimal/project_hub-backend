import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISprintRepo } from "../../infrastructure/interface/repositories/ISprintRepo";
import { Sprint } from "../../domain/entities/Sprint";
import { ValidationError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../infrastructure/interface/services/ILogger";

export interface ICreateSprintUseCase {
  execute(data: Partial<Sprint>): Promise<Sprint>;
}

@injectable()
export class CreateSprintUseCase implements ICreateSprintUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(data: Partial<Sprint>): Promise<Sprint> {
    if (!data.projectId) throw new ValidationError("Project ID is required");

    // Check sprint limit for today
    const sprintsToday = await this._sprintRepo.countSprint(data.projectId);

    if (sprintsToday >= 2) {
      throw new ValidationError(
        "Daily limit reached. You can only create 2 Sprints per day.",
      );
    }

    this._logger.info(`Creating new sprint in project ${data.projectId}`);

    // Default status if not provided
    const sprintData = {
      ...data,
      status: data.status || "PLANNED",
    };

    return await this._sprintRepo.create(sprintData);
  }
}
