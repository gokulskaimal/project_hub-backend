import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IToggleTimerUseCase } from "../interface/useCases/IToggleTimerUseCase";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";

@injectable()
export class ToggleTimerUseCase implements IToggleTimerUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
  ) {}

  async execute(
    taskId: string,
    userId: string,
    action: "start" | "stop",
  ): Promise<Task | null> {
    const task = await this._taskRepo.findById(taskId);
    if (!task) throw new EntityNotFoundError("Task Not Found", taskId);

    const now = new Date();

    if (!task.timeLogs) {
      task.timeLogs = [];
    }

    const activityLogsIndex = task.timeLogs.findIndex(
      (log) => log.userId === userId && !log.endTime,
    );

    if (action == "start") {
      if (activityLogsIndex !== -1) {
        throw new Error("Timer is already running for this task");
      }
      task.timeLogs.push({
        userId,
        startTime: now,
      });
    } else if (action == "stop") {
      if (activityLogsIndex == -1) {
        throw new Error("Timer is not running for this task");
      }

      const activityLog = task.timeLogs[activityLogsIndex];
      activityLog.endTime = now;
      activityLog.duration =
        now.getTime() - new Date(activityLog.startTime).getTime();

      task.totalTimeSpent = (task.totalTimeSpent || 0) + activityLog.duration;

      task.timeLogs[activityLogsIndex] = activityLog;
    }

    const updatedTask = await this._taskRepo.update(taskId, {
      timeLogs: task.timeLogs,
      totalTimeSpent: task.totalTimeSpent,
    });

    if (updatedTask) {
      this._socketService.emitToOrganization(
        task.orgId,
        "task:updated",
        updatedTask,
      );
    }

    return updatedTask;
  }
}
