import { inject, injectable } from "inversify";
import { INotificationService } from "../../domain/interface/services/INotificationService";
import { INotificationRepo } from "../../application/interface/repositories/INotificationRepo";
import { ISocketService } from "../../application/interface/services/ISocketService";
import { TYPES } from "../container/types";
import { NotificationType } from "../../domain/enums/NotificationType";
import { Task } from "../../domain/entities/Task";
import { User } from "../../domain/entities/User";
import { Notification } from "../../domain/entities/Notification";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.INotificationRepo)
    private _notificationRepo: INotificationRepo,
    @inject(TYPES.ISocketService)
    private _socketService: ISocketService,
  ) {}

  async notifyTaskAssignment(task: Task, assignedBy: User): Promise<void> {
    if (!task.assignedTo || !task.orgId) return;

    const message = `Task '${task.title}' assigned to you by ${this.formatUserName(assignedBy)}`;
    await this.sendSystemNotification(
      task.assignedTo,
      "New Task Assigned",
      message,
      NotificationType.INFO,
      task.orgId,
      `/manager/projects/${task.projectId}`,
    );
  }

  async notifyTaskStatusChange(
    task: Task,
    updatedBy: User,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    if (!task.assignedTo || task.assignedTo === updatedBy.id || !task.orgId)
      return;

    const message = `Task '${task.title}' status updated from ${oldStatus} to ${newStatus} by ${this.formatUserName(updatedBy)}`;
    await this.sendSystemNotification(
      task.assignedTo,
      "Task Status Updated",
      message,
      NotificationType.INFO,
      task.orgId,
      `/manager/projects/${task.projectId}`,
    );
  }

  async sendSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    orgId: string,
    link?: string,
  ): Promise<void> {
    const notification = new Notification(
      "",
      userId,
      title,
      message,
      type,
      link || "",
      false,
      new Date(),
      orgId,
    );
    const saved = await this._notificationRepo.create(notification);
    this._socketService.emitToUser(userId, "notification:new", saved);
  }

  private formatUserName(user: User): string {
    if (user.firstName) {
      return `${user.firstName} ${user.lastName || ""}`.trim();
    }
    return user.name || "User";
  }
}
