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

import { ITaskHistoryRepo } from "../../infrastructure/interface/repositories/ITaskHistoryRepo";
import { ISprintRepo } from "../../infrastructure/interface/repositories/ISprintRepo";
import { IProjectRepo } from "../../infrastructure/interface/repositories/IProjectRepo";

@injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.ICreateNotificationUseCase)
    private _createNotificationUC: ICreateNotificationUseCase,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ITaskHistoryRepo) private _historyRepo: ITaskHistoryRepo,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
  ) {}

  async execute(
    id: string,
    data: Partial<Task>,
    updaterId?: string,
  ): Promise<Task> {
    this._logger.info(`Executing UpdateTaskUseCase for task ID: ${id}`);
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task Not Found", id);

    //Validation Logic
    if (updaterId) {
      const updater = await this._userRepo.findById(updaterId);
      if (updater) {
        if (task.status === "DONE") {
          throw new ValidationError(
            "Task is Completed and cannot be modified.",
          );
        }

        const isManager = updater.role === UserRole.ORG_MANAGER;

        if (!isManager) {
          if (data.status === "DONE") {
            throw new ValidationError("Only Managers can mark a task as Done.");
          }
          if (task.status === "REVIEW") {
            throw new ValidationError(
              "Task is under Review. Only Manager can update status.",
            );
          }
          if (task.status === "IN_PROGRESS" && data.status === "TODO") {
            throw new ValidationError(
              "Tasks currently In Progress cannot be moved back to Todo.",
            );
          }
        }
      }
    }

    if (data.dueDate || data.sprintId) {
      const effectiveDueDateStr =
        data.dueDate !== undefined ? data.dueDate : task.dueDate;
      const effectiveSprintId =
        data.sprintId !== undefined ? data.sprintId : task.sprintId;

      if (effectiveDueDateStr) {
        const taskDueDate = new Date(effectiveDueDateStr);
        if (effectiveSprintId) {
          const sprint = await this._sprintRepo.findById(effectiveSprintId);
          if (sprint && sprint.startDate && sprint.endDate) {
            const sprintStart = new Date(sprint.startDate);
            const sprintEnd = new Date(sprint.endDate);
            if (taskDueDate < sprintStart || taskDueDate > sprintEnd) {
              throw new ValidationError(
                "Task due date must be within the assigned Sprint's start and end dates.",
              );
            }
          }
        } else {
          const project = await this._projectRepo.findById(task.projectId);
          if (project) {
            const projectEnd = new Date(project.endDate);
            const projectStart = project.startDate
              ? new Date(project.startDate)
              : null;
            if (projectStart && taskDueDate < projectStart) {
              throw new ValidationError(
                "Task due date cannot be before Project start date.",
              );
            }
            if (taskDueDate > projectEnd) {
              throw new ValidationError(
                "Task due date cannot be after Project end date.",
              );
            }
          }
        }
      }
    }
    //Validation Logic

    //Time Tracking Logic
    if (data.status && data.status !== task.status && updaterId) {
      const isAssignee = task.assignedTo === updaterId;

      if (!task.timeLogs) {
        task.timeLogs = [];
      }

      if (data.status === "IN_PROGRESS" && isAssignee) {
        const runningLog = task.timeLogs.find(
          (log) => log.userId === updaterId && !log.endTime,
        );

        if (!runningLog) {
          task.timeLogs.push({
            userId: updaterId,
            startTime: new Date(),
          });
          data.timeLogs = task.timeLogs;
        }
      }

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

          log.duration = now.getTime() - new Date(log.startTime).getTime();
          task.totalTimeSpent = (task.totalTimeSpent || 0) + log.duration;
          task.timeLogs[runningIndex] = log;

          data.timeLogs = task.timeLogs;
          data.totalTimeSpent = task.totalTimeSpent;
        }
      }
    }
    // Tracking Logic

    // Task History Tracking
    if (updaterId) {
      if (data.status && data.status !== task.status) {
        await this._historyRepo.create({
          taskId: task.id,
          userId: updaterId,
          action: "STATUS_CHANGED",
          previousValue: task.status,
          newValue: data.status,
          createdAt: new Date(),
        });
      }
      if (
        data.assignedTo !== undefined &&
        data.assignedTo !== task.assignedTo
      ) {
        await this._historyRepo.create({
          taskId: task.id,
          userId: updaterId,
          action: "ASSIGNEE_CHANGED",
          previousValue: task.assignedTo || "Unassigned",
          newValue: data.assignedTo || "Unassigned",
          createdAt: new Date(),
        });
      }
      if (data.sprintId !== undefined && data.sprintId !== task.sprintId) {
        await this._historyRepo.create({
          taskId: task.id,
          userId: updaterId,
          action: "SPRINT_CHANGED",
          previousValue: task.sprintId || "Backlog",
          newValue: data.sprintId || "Backlog",
          createdAt: new Date(),
        });
      }
    }
    // Task History Tracking

    const updated = await this._taskRepo.update(id, data);
    if (!updated) throw new EntityNotFoundError("Task Not Found", id);

    if (task.orgId) {
      this._socketService.emitToOrganization(
        task.orgId,
        "task:updated",
        updated,
      );
    }

    if (task.orgId && updaterId) {
      const managers = await this._userRepo.findByOrgAndRole(
        task.orgId,
        UserRole.ORG_MANAGER,
      );
      const updater = await this._userRepo.findById(updaterId);
      const updaterName = updater ? this.formatUserName(updater) : "User";

      if (updaterId === task.assignedTo) {
        for (const manager of managers) {
          if (manager.id === updaterId) continue;
          await this._createNotificationUC.execute(
            manager.id,
            "Task Update from Member",
            `Task '${updated.title}' updated by ${updaterName} (Status: ${data.status || updated.status})`,
            NotificationType.INFO,
            `/manager/projects/${updated.projectId}`,
          );
        }
      }

      if (updated.assignedTo && updaterId !== updated.assignedTo) {
        await this._createNotificationUC.execute(
          updated.assignedTo,
          "Task Updated by Manager",
          `Task '${updated.title}' updated by ${updaterName} (Status: ${data.status || updated.status})`,
          NotificationType.INFO,
          `/manager/projects/${updated.projectId}`,
        );

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
