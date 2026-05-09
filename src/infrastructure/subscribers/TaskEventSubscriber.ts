import { injectable, inject } from "inversify";
import { TYPES } from "../container/types";
import { IEventDispatcher } from "../../application/interface/services/IEventDispatcher";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { ITaskRepo } from "../../application/interface/repositories/ITaskRepo";
import { ITaskHistoryRepo } from "../../application/interface/repositories/ITaskHistoryRepo";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { ILogger } from "../../application/interface/services/ILogger";
import {
  TaskUpdatedPayload,
  TaskCreatedPayload,
  TaskDeletedPayload,
  TASK_EVENTS,
} from "../../application/events/TaskEvents";
import { Task } from "../../domain/entities/Task";
import { UserRole } from "../../domain/enums/UserRole";
import { NotificationType } from "../../domain/enums/NotificationType";
import { IEventSubscriber } from "../../application/interface/services/IEventSubscriber";
import { EventDispatcher } from "../services/EventDispatcher";

@injectable()
export class TaskEventSubscriber implements IEventSubscriber {
  constructor(
    @inject(TYPES.IEventDispatcher) private _eventDispatcher: IEventDispatcher,
    @inject(TYPES.ISocketService) private _socketService: ISocketService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService,
    @inject(TYPES.ITaskHistoryRepo) private _historyRepo: ITaskHistoryRepo,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.ITaskRepo) private _taskRepo: ITaskRepo,
    @inject(TYPES.ILogger) private _logger: ILogger,
  ) {}

  /**
   * Initialize listeners
   */
  public init(): void {
    if (this._eventDispatcher instanceof EventDispatcher) {
      this._eventDispatcher.on(TASK_EVENTS.UPDATED, (data) =>
        this.handleTaskUpdated(data as TaskUpdatedPayload),
      );
      this._eventDispatcher.on(TASK_EVENTS.CREATED, (data) =>
        this.handleTaskCreated(data as TaskCreatedPayload),
      );
      this._eventDispatcher.on(TASK_EVENTS.DELETED, (data) =>
        this.handleTaskDeleted(data as TaskDeletedPayload),
      );
      this._logger.info("TaskEventSubscriber: Listeners initialized.");
    }
  }

  private async handleTaskCreated(payload: TaskCreatedPayload): Promise<void> {
    const { task, creatorId } = payload;
    const { orgId, projectId, assignedTo, title } = task;

    try {
      // 1. Log History
      await this._historyRepo.create({
        taskId: task.id,
        userId: creatorId,
        action: "CREATED",
        newValue: title,
        createdAt: new Date(),
      });

      // 2. Real-time Socket Updates
      this._socketService.emitToProject(projectId, "task:created", task);
      if (orgId) {
        this._socketService.emitToRoleInOrg(
          orgId,
          UserRole.ORG_MANAGER,
          "task:created",
          task,
        );
      }

      // 3. Notifications for Assignee
      if (assignedTo && assignedTo !== creatorId) {
        const creator = await this._userRepo.findById(creatorId);
        const creatorName = creator
          ? `${creator.firstName} ${creator.lastName || ""}`
          : "A manager";

        await this._notificationService.sendSystemNotification(
          assignedTo,
          "New Task Assigned",
          `You have been assigned a new task: '${title}' by ${creatorName}`,
          NotificationType.INFO,
          orgId!,
          `/member/projects/${projectId}`,
        );
        this._socketService.emitToUser(assignedTo, "task:assigned", task);
      }
    } catch (error) {
      this._logger.error(
        "Error in TaskEventSubscriber.handleTaskCreated:",
        error as Error,
      );
    }
  }

  private async handleTaskDeleted(payload: TaskDeletedPayload): Promise<void> {
    const { taskId, projectId, orgId, deleterId, taskTitle } = payload;

    try {
      // 1. Log History (Note: Task might be gone from main table, but we log the deletion)
      await this._historyRepo.create({
        taskId,
        userId: deleterId,
        action: "DELETED",
        previousValue: taskTitle,
        createdAt: new Date(),
      });

      // 2. Real-time Socket Updates
      this._socketService.emitToProject(projectId, "task:deleted", { taskId });
      if (orgId) {
        this._socketService.emitToRoleInOrg(
          orgId,
          UserRole.ORG_MANAGER,
          "task:deleted",
          { taskId },
        );
      }
    } catch (error) {
      this._logger.error(
        "Error in TaskEventSubscriber.handleTaskDeleted:",
        error as Error,
      );
    }
  }

  private async handleTaskUpdated(payload: TaskUpdatedPayload): Promise<void> {
    const { oldTask, updatedTask, updaterId, changes } = payload;
    const orgId = updatedTask.orgId;

    try {
      // 1. Log History
      if (updaterId) {
        await this.logHistory(oldTask, updatedTask, updaterId, changes);
      }

      if (orgId) {
        this._socketService.emitToRoleInOrg(
          orgId,
          UserRole.ORG_MANAGER,
          "task:updated",
          updatedTask,
        );
      }

      // NEW: Auto-Epic Completion Logic
      if (
        updatedTask.type === "STORY" &&
        updatedTask.status === "DONE" &&
        updatedTask.epicId
      ) {
        await this.checkAndCompleteEpic(
          updatedTask.epicId,
          updatedTask.projectId,
          orgId!,
        );
      }

      // 3. Notifications
      if (orgId && updaterId) {
        await this.handleNotifications(payload);
      }
    } catch (error) {
      this._logger.error(
        "Error in TaskEventSubscriber.handleTaskUpdated:",
        error as Error,
      );
    }
  }

  private async logHistory(
    oldTask: Task,
    updatedTask: Task,
    updaterId: string,
    changes: Partial<Task>,
  ): Promise<void> {
    const actions: Array<{ action: string; prev: string; next: string }> = [];
    if (changes.status && changes.status !== oldTask.status) {
      actions.push({
        action: "STATUS_CHANGED",
        prev: oldTask.status,
        next: changes.status,
      });
    }
    if (
      changes.assignedTo !== undefined &&
      changes.assignedTo !== oldTask.assignedTo
    ) {
      actions.push({
        action: "ASSIGNEE_CHANGED",
        prev: oldTask.assignedTo || "Unassigned",
        next: changes.assignedTo || "Unassigned",
      });
    }
    if (
      changes.sprintId !== undefined &&
      changes.sprintId !== oldTask.sprintId
    ) {
      actions.push({
        action: "SPRINT_CHANGED",
        prev: oldTask.sprintId || "Backlog",
        next: changes.sprintId || "Backlog",
      });
    }

    for (const item of actions) {
      await this._historyRepo.create({
        taskId: updatedTask.id,
        userId: updaterId,
        action: item.action as
          | "CREATED"
          | "UPDATED"
          | "DELETED"
          | "STATUS_CHANGED"
          | "ASSIGNEE_CHANGED"
          | "SPRINT_CHANGED",
        previousValue: item.prev,
        newValue: item.next,
        createdAt: new Date(),
      });
    }
  }

  private async handleNotifications(
    payload: TaskUpdatedPayload,
  ): Promise<void> {
    const { updatedTask, updaterId, changes } = payload;
    const orgId = updatedTask.orgId!;

    // Find the updater's name
    const updater = await this._userRepo.findById(updaterId!);
    const updaterName = updater
      ? updater.firstName
        ? `${updater.firstName} ${updater.lastName || ""}`
        : updater.name
      : "A user";

    // Notify Managers if a Member updated their own task
    if (updaterId === updatedTask.assignedTo) {
      const managers = await this._userRepo.findByOrgAndRole(
        orgId,
        UserRole.ORG_MANAGER,
      );
      for (const manager of managers) {
        if (manager.id === updaterId) continue;
        await this._notificationService.sendSystemNotification(
          manager.id,
          "Task Update from Member",
          `Task '${updatedTask.title}' updated by ${updaterName} (Status: ${changes.status || updatedTask.status})`,
          NotificationType.INFO,
          orgId,
          `/manager/projects/${updatedTask.projectId}`,
        );
      }
    }

    // Notify Assignee if someone else updated it
    if (updatedTask.assignedTo && updaterId !== updatedTask.assignedTo) {
      await this._notificationService.sendSystemNotification(
        updatedTask.assignedTo,
        "Task Updated",
        `Task '${updatedTask.title}' updated by ${updaterName}`,
        NotificationType.INFO,
        orgId,
        `/member/projects/${updatedTask.projectId}`,
      );
      this._socketService.emitToUser(
        updatedTask.assignedTo,
        "task:assigned",
        updatedTask,
      );
    }
  }

  private async checkAndCompleteEpic(
    epicId: string,
    projectId: string,
    orgId: string,
  ): Promise<void> {
    this._logger.info("Checking the epic info");

    const stories = await this._taskRepo.findByEpic(epicId);
    if (stories.length === 0) return;

    const allDone = stories.every((s) => s.status === "DONE");

    if (allDone) {
      const epic = await this._taskRepo.findById(epicId);
      if (epic && epic.status !== "DONE") {
        this._logger.info(`All stories done. Marking Epic ${epicId} as DONE`);

        // Update Epic Status directly
        await this._taskRepo.update(epicId, {
          status: "DONE",
          completedAt: new Date(),
        });
        // Emit real-time update for the Epic
        const updatedEpic = {
          ...epic,
          status: "DONE",
          completedAt: new Date(),
        };
        this._socketService.emitToProject(
          projectId,
          "task:updated",
          updatedEpic,
        );
        this._socketService.emitToRoleInOrg(
          orgId,
          UserRole.ORG_MANAGER,
          "task:updated",
          updatedEpic,
        );

        this._logger.info(`Epic ${epicId} auto-completed successfully.`);
      }
    }
  }
}
