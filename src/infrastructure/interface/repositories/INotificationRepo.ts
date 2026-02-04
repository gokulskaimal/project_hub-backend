import { Notification } from "../../../domain/entities/Notification";

export interface INotificationRepo {
  create(notification: Notification): Promise<Notification>;
  findByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
