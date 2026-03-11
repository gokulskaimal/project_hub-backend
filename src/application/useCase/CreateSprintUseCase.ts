import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
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
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(data: Partial<Sprint>): Promise<Sprint> {
    if (!data.projectId) throw new ValidationError("Project ID is required");
    if (!data.startDate || !data.endDate) {
      throw new ValidationError("Start Date and End Date are required");
    }

    const project = await this._projectRepo.findById(data.projectId);
    if (!project) {
      throw new ValidationError("Project not found");
    }

    const sprintStart = new Date(data.startDate);
    const sprintEnd = new Date(data.endDate);
    const projectEnd = new Date(project.endDate);
    const projectStart = project.startDate ? new Date(project.startDate) : null;

    if (projectStart && sprintStart < projectStart) {
      throw new ValidationError(
        "Sprint start date is before project start date",
      );
    }

    if (sprintEnd > projectEnd) {
      throw new ValidationError("Sprint end date is after project end date");
    }

    // // Check sprint limit for today
    // const sprintsToday = await this._sprintRepo.countSprint(data.projectId);

    // if (sprintsToday >= 2) {
    //   throw new ValidationError(
    //     "Daily limit reached. You can only create 2 Sprints per day.",
    //   );
    // }

    this._logger.info(`Creating new sprint in project ${data.projectId}`);

    const sprintData = {
      ...data,
      status: data.status || "PLANNED",
    };

    return await this._sprintRepo.create(sprintData);
  }
}
