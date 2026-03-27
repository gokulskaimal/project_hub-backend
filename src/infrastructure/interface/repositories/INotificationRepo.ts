import { Notification } from "../../../domain/entities/Notification";

export interface INotificationRepo {
  create(notification: Notification): Promise<Notification>;
  findByUser(userId: string, orgId?: string): Promise<Notification[]>;
  markAsRead(id: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
