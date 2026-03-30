import { NotificationType } from "../../enums/NotificationType";
import { Task } from "../../entities/Task";
import { User } from "../../entities/User";

export interface INotificationService {
  notifyTaskAssignment(task: Task, assignedBy: User): Promise<void>;
  notifyTaskStatusChange(
    task: Task,
    updatedBy: User,
    oldStatus: string,
    newStatus: string,
  ): Promise<void>;
  sendSystemNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    orgId: string,
    link?: string,
  ): Promise<void>;
}
