import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../infrastructure/interface/repositories/ITaskRepo";
import { IUpdateTaskUseCase } from "../interface/useCases/IUpdateTaskUseCase";
import { Task } from "../../domain/entities/Task";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";

import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";
import { NotificationType } from "../../domain/enums/NotificationType";
import { User } from "../../domain/entities/User";

@injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUC: ICreateNotificationUseCase,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
  ) {}

  async execute(
    id: string,
    data: Partial<Task>,
    updaterId?: string,
  ): Promise<Task> {
    this._logger.info(`Executing UpdateTaskUseCase for task ID: ${id}`);
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task Not Found", id);

    // [START] Validation Logic
    if (updaterId) {
      const updater = await this._userRepo.findById(updaterId);
      if (updater) {
        // Rule 1: Once DONE, the task is locked permanently.
        if (task.status === "DONE") {
          throw new ValidationError(
            "Task is Completed and cannot be modified.",
          );
        }

        const isManager = updater.role === UserRole.ORG_MANAGER;

        if (!isManager) {
          // Rule 2: Team Members cannot set status to DONE.
          if (data.status === "DONE") {
            throw new ValidationError("Only Managers can mark a task as Done.");
          }

          // Rule 3: Functionality Lock - Once in REVIEW, Member cannot edit or revert.
          if (task.status === "REVIEW") {
            throw new ValidationError(
              "Task is under Review. Only Manager can update status.",
            );
          }

          // Rule 4: No Revert - Member cannot move from IN_PROGRESS back to TODO
          if (task.status === "IN_PROGRESS" && data.status === "TODO") {
            throw new ValidationError(
              "Tasks currently In Progress cannot be moved back to Todo.",
            );
          }
        }
      }
    }
    // [END] Validation Logic

    // [START] Automated Time Tracking Logic
    // If status is changing and we have an updater
    if (data.status && data.status !== task.status && updaterId) {
      // Only automate if the person moving the task is the assignee
      const isAssignee = task.assignedTo === updaterId;

      // Ensure timeLogs array exists
      if (!task.timeLogs) {
        task.timeLogs = [];
      }

      // Case 1: Moving TO 'IN_PROGRESS' -> Start Timer
      if (data.status === "IN_PROGRESS" && isAssignee) {
        // Check if timer is already running for this user
        const runningLog = task.timeLogs.find(
          (log) => log.userId === updaterId && !log.endTime,
        );

        if (!runningLog) {
          task.timeLogs.push({
            userId: updaterId,
            startTime: new Date(),
          });
          // Important: Update the data object to persist changes
          data.timeLogs = task.timeLogs;
        }
      }

      // Case 2: Moving FROM 'IN_PROGRESS' (to anything else) -> Stop Timer
      if (
        task.status === "IN_PROGRESS" &&
        data.status !== "IN_PROGRESS" &&
        isAssignee
      ) {
        const runningIndex = task.timeLogs.findIndex(
          (log) => log.userId === updaterId && !log.endTime,
        );

        if (runningIndex !== -1) {
          const log = task.timeLogs[runningIndex];
          const now = new Date();
          log.endTime = now;

          // Calculate duration in milliseconds
          log.duration = now.getTime() - new Date(log.startTime).getTime();

          // Update total time spent
          task.totalTimeSpent = (task.totalTimeSpent || 0) + log.duration;
          task.timeLogs[runningIndex] = log;

          // Important: Update the data object to persist changes
          data.timeLogs = task.timeLogs;
          data.totalTimeSpent = task.totalTimeSpent;
        }
      }
    }
    // [END] Automated Time Tracking Logic

    const updated = await this._taskRepo.update(id, data);
    if (!updated) throw new EntityNotFoundError("Task Not Found", id);

    // Notify organization about the update (for Kanban refresh)
    if (task.orgId) {
      this._socketService.emitToOrganization(
        task.orgId,
        "task:updated",
        updated,
      );
    }

    // Bidirectional Notifications
    if (task.orgId && updaterId) {
      const managers = await this._userRepo.findByOrgAndRole(
        task.orgId,
        UserRole.ORG_MANAGER,
      );
      const updater = await this._userRepo.findById(updaterId);
      const updaterName = updater ? this.formatUserName(updater) : "User";

      // Case A: Updater is the Assignee -> Notify Managers
      if (updaterId === task.assignedTo) {
        // Notify Managers
        for (const manager of managers) {
          if (manager.id === updaterId) continue; // Don't notify self

          await this._createNotificationUC.execute(
            manager.id,
            "Task Update from Member",
            `Task '${updated.title}' updated by ${updaterName} (Status: ${data.status || updated.status})`,
            NotificationType.INFO,
            `/manager/projects/${updated.projectId}`,
          );
        }
      }

      // Case B: Updater is a Manager (or anyone else) -> Notify Assignee
      if (updated.assignedTo && updaterId !== updated.assignedTo) {
        await this._createNotificationUC.execute(
          updated.assignedTo,
          "Task Updated by Manager",
          `Task '${updated.title}' updated by ${updaterName} (Status: ${data.status || updated.status})`,
          NotificationType.INFO,
          `/manager/projects/${updated.projectId}`,
        );

        // Also emit socket for real-time update
        this._socketService.emitToUser(
          updated.assignedTo,
          "task:assigned",
          updated,
        );
      }
    }

    return updated;
  }

  private formatUserName(user: User): string {
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ""}`.trim();
    }
    return user.name || "User";
  }
}
