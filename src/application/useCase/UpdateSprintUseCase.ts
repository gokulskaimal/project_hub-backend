import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISprintRepo } from "../../infrastructure/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";
import { Sprint } from "../../domain/entities/Sprint";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IUpdateSprintUseCase } from "../interface/useCases/IUpdateSprintUseCase";

@injectable()
export class UpdateSprintUseCase implements IUpdateSprintUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(id: string, updateData: Partial<Sprint>): Promise<Sprint> {
    this._logger.info(`Updating sprint ${id}`);

    const sprint = await this._sprintRepo.findById(id);
    if (!sprint) throw new EntityNotFoundError("Sprint", id);

    if (updateData.startDate || updateData.endDate) {
      const project = await this._projectRepo.findById(sprint.projectId);
      if (project) {
        const sprintStart = updateData.startDate
          ? new Date(updateData.startDate)
          : new Date(sprint.startDate);
        const sprintEnd = updateData.endDate
          ? new Date(updateData.endDate)
          : new Date(sprint.endDate);

        const projectEnd = new Date(project.endDate);
        const projectStart = project.startDate
          ? new Date(project.startDate)
          : null;

        if (projectStart && sprintStart < projectStart) {
          throw new ValidationError(
            "Sprint start date cannot be before Project start date",
          );
        }
        if (sprintEnd > projectEnd) {
          throw new ValidationError(
            "Sprint end date cannot be after Project end date",
          );
        }
      }
    }

    const updatedSprint = await this._sprintRepo.update(id, updateData);
    if (!updatedSprint) throw new EntityNotFoundError("Sprint", id);

    if (updateData.status === "COMPLETED") {
      const tasks = await this._taskRepo.findAll({ sprintId: id });
      const unfinishedTasks = tasks.filter((t) => t.status !== "DONE");

      await Promise.all(
        unfinishedTasks.map((t) => {
          let updatedTotalTime = t.totalTimeSpent || 0;
          const updatedLogs = t.timeLogs ? [...t.timeLogs] : [];

          t.timeLogs?.forEach((log, index) => {
            if (!log.endTime) {
              const now = new Date();
              log.endTime = now;
              log.duration = now.getTime() - new Date(log.startTime).getTime();
              updatedTotalTime += log.duration;
              updatedLogs[index] = log;
            }
          });

          return this._taskRepo.update(t.id, {
            sprintId: null, // Move unfinished items back to Backlog
            timeLogs: updatedLogs,
            totalTimeSpent: updatedTotalTime,
          });
        }),
      );
    }

    return updatedSprint;
  }
}
