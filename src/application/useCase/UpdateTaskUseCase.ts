import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { IUpdateTaskUseCase } from "../interface/useCases/IUpdateTaskUseCase";
import { Task } from "../../domain/entities/Task";
import {
  EntityNotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../domain/errors/CommonErrors";

import { ILogger } from "../../application/interface/services/ILogger";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { UserRole } from "../../domain/enums/UserRole";
import { NotificationType } from "../../domain/enums/NotificationType";
import { User } from "../../domain/entities/User";

import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { ISprintRepo } from "../../application/interface/repositories/ISprintRepo";
import { IProjectRepo } from "../../application/interface/repositories/IProjectRepo";
import { ITaskDomainService } from "../../domain/interface/services/ITaskDomainService";
import { ITimeTrackingService } from "../../domain/interface/services/ITimeTrackingService";

@injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ITaskHistoryRepo) private _historyRepo: ITaskHistoryRepo,
    @inject(TYPES.ISprintRepo) private _sprintRepo: ISprintRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.ITaskDomainService)
    private _taskDomainService: ITaskDomainService,
    @inject(TYPES.ISecurityService) private _securityService: ISecurityService,
    @inject(TYPES.ITimeTrackingService)
    private _timeTrackingService: ITimeTrackingService,
  ) {}

  async execute(
    id: string,
    data: Partial<Task>,
    updaterId?: string,
  ): Promise<Task> {
    this._logger.info(`Executing UpdateTaskUseCase for task ID: ${id}`);
    const task = await this._taskRepo.findById(id);
    if (!task) throw new EntityNotFoundError("Task Not Found", id);

    // RBAC Check
    if (updaterId && task.orgId) {
      await this._securityService.validateOrgAccess(updaterId, task.orgId);
    }

    // Sprint Immutability Check (Velocity Protection)
    if (task.sprintId) {
      const currentSprint = await this._sprintRepo.findById(task.sprintId);
      if (currentSprint && currentSprint.status === "COMPLETED") {
        const updater = updaterId
          ? await this._userRepo.findById(updaterId)
          : null;
        if (updater?.role !== UserRole.SUPER_ADMIN) {
          throw new ValidationError(
            "Tasks in completed sprints are locked and cannot be modified.",
          );
        }
      }
    }

    // 1. Validation
    if (updaterId) {
      const updater = await this._userRepo.findById(updaterId);
      if (updater) {
        //Strict Role Control
        if (
          updater.role !== UserRole.ORG_MANAGER &&
          updater.role !== UserRole.SUPER_ADMIN
        ) {
          // If NOT a manager
          const allowedFields = [
            "status",
            "timeLogs",
            "totalTimeSpent",
            "completedAt",
            "comments",
            "attachments",
          ];
          const attemptedFields = Object.keys(data).filter(
            (key) => data[key as keyof Partial<Task>] !== undefined,
          );
          const hasUnauthorizedFields = attemptedFields.some(
            (field) => !allowedFields.includes(field),
          );

          if (hasUnauthorizedFields) {
            throw new ForbiddenError(
              "Members can only update task status, comments, and attachments. Core details are reserved for Managers.",
            );
          }
        }

        this._taskDomainService.validateStatusTransition(
          task,
          data.status,
          updater,
        );
      }
    }

    // Filter out undefined values to prevent accidental overwrites of existing data
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    // Merged Task for Validation
    const mergedTask = { ...task, ...filteredData } as Task;

    // Domain Rule: Assignment to Sprint (Must be estimated)
    if (data.sprintId && data.sprintId !== task.sprintId) {
      this._taskDomainService.validateAssignmentToSprint(mergedTask);
    }

    // Domain Rule: Definition of Done (Must have assignee)
    if (data.status === "DONE" && task.status !== "DONE") {
      this._taskDomainService.validateDefinitionOfDone(mergedTask);
    }

    if (data.dueDate !== undefined || data.sprintId !== undefined) {
      const effectiveDueDateStr =
        data.dueDate !== undefined ? data.dueDate : task.dueDate;
      const effectiveSprintId =
        data.sprintId !== undefined ? data.sprintId : task.sprintId;

      if (effectiveDueDateStr) {
        const taskDueDate = new Date(effectiveDueDateStr);
        const sprint = effectiveSprintId
          ? await this._sprintRepo.findById(effectiveSprintId)
          : null;
        const project = await this._projectRepo.findById(task.projectId);

        this._taskDomainService.validateDueDate(taskDueDate, sprint, project);
      }
    }

    // 2. Sprint Capacity Check
    if (data.sprintId && data.sprintId !== task.sprintId) {
      const sprint = await this._sprintRepo.findById(data.sprintId);
      if (!sprint) throw new ValidationError("Sprint not found");

      if (sprint.status === "COMPLETED") {
        throw new ValidationError(`Cannot assign tasks to a completed sprint.`);
      }

      // Daily limit check
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const dailyCount = await this._taskRepo.countBySprintAssignedAtRange(
        data.sprintId,
        startOfDay,
        endOfDay,
      );
      if (dailyCount >= 20) {
        throw new ValidationError(
          "Daily sprint task limit reached (max 20 tasks per day).",
        );
      }

      // Total sprint capacity check
      const project = await this._projectRepo.findById(sprint.projectId);
      const capacity = this._taskDomainService.calculateSprintCapacity(
        sprint,
        project?.tasksPerWeek,
      );
      const currentCount = await this._taskRepo.countBySprint(data.sprintId);

      if (currentCount >= capacity) {
        throw new ValidationError("Sprint task capacity exceeded.");
      }

      data.sprintAssignedAt = new Date();
    }

    //Time Tracking Logic
    if (data.status && data.status !== task.status && updaterId) {
      this._timeTrackingService.updateTimeLogs(task, data.status, updaterId);
      data.timeLogs = task.timeLogs;
      data.totalTimeSpent = task.totalTimeSpent;
    }
    // Tracking Logic

    if (data.status === "DONE" && task.status !== "DONE") {
      data.completedAt = new Date();
    }

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
      // [NEW] Targeted Real-time Alerts
      // 1. Project Room
      this._socketService.emitToProject(
        updated.projectId,
        "task:updated",
        updated,
      );

      // 2. Org Managers
      this._socketService.emitToRoleInOrg(
        task.orgId,
        UserRole.ORG_MANAGER,
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
          await this._notificationService.sendSystemNotification(
            manager.id,
            "Task Update from Member",
            `Task '${updated.title}' updated by ${updaterName} (Status: ${data.status || updated.status})`,
            NotificationType.INFO,
            task.orgId,
            `/manager/projects/${updated.projectId}`,
          );
        }
      }

      if (updated.assignedTo && updaterId !== updated.assignedTo) {
        await this._notificationService.sendSystemNotification(
          updated.assignedTo,
          "Task Updated by Manager",
          `Task '${updated.title}' updated by ${updaterName} (Status: ${data.status || updated.status})`,
          NotificationType.INFO,
          task.orgId,
          `/manager/projects/${updated.projectId}`,
        );

        this._socketService.emitToUser(
          updated.assignedTo,
          "task:assigned",
          updated,
        );
      }

      // Validate assignee if it's being changed
      if (data.assignedTo) {
        await this._securityService.validateUserBelongsToOrg(
          data.assignedTo,
          task.orgId,
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
