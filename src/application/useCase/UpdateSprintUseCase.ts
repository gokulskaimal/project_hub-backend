import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISprintRepo } from "../../infrastructure/interface/repositories/ISprintRepo";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { Sprint } from "../../domain/entities/Sprint";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IUpdateSprintUseCase } from "../interface/useCases/IUpdateSprintUseCase";

@injectable()
export class UpdateSprintUseCase implements IUpdateSprintUseCase {
  constructor(
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  async execute(id: string, updateData: Partial<Sprint>): Promise<Sprint> {
    this._logger.info(`Updating sprint ${id}`);

    const updatedSprint = await this._sprintRepo.update(id, updateData);
    if (!updatedSprint) throw new EntityNotFoundError("Sprint", id);

    // Business Logic: Completing a sprint stops active timers and unassigns unfinished tasks
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
            sprintId: null,
            timeLogs: updatedLogs,
            totalTimeSpent: updatedTotalTime,
          });
        }),
      );
    }

    return updatedSprint;
  }
}
