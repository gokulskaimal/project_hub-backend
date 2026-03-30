import { inject, injectable } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { UserRole } from "../../domain/enums/UserRole";
import { IToggleTimerUseCase } from "../interface/useCases/IToggleTimerUseCase";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { Task } from "../../domain/entities/Task";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class ToggleTimerUseCase implements IToggleTimerUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
  ) {}

  async execute(
    taskId: string,
    userId: string,
    action: "start" | "stop",
  ): Promise<Task | null> {
    const task = await this._taskRepo.findById(taskId);
    if (!task) throw new EntityNotFoundError("Task Not Found", taskId);

    // RBAC Check
    if (task.orgId) {
      await this._securityService.validateOrgAccess(userId, task.orgId);
    }

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

    if (updatedTask && task.orgId) {
      // 1. Project Room
      this._socketService.emitToProject(
        updatedTask.projectId,
        "task:updated",
        updatedTask,
      );

      // 2. Org Managers
      this._socketService.emitToRoleInOrg(
        task.orgId,
        UserRole.ORG_MANAGER,
        "task:updated",
        updatedTask,
      );
    }

    return updatedTask;
  }
}
