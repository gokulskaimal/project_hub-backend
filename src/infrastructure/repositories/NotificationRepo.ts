import { injectable } from "inversify";
import { INotificationRepo } from "../interface/repositories/INotificationRepo";
import { Notification } from "../../domain/entities/Notification";
import {
  INotificationDoc,
  NotificationModel,
} from "../models/NotificationModel";

@injectable()
export class NotificationRepo implements INotificationRepo {
  async create(notification: Notification): Promise<Notification> {
    const doc = await NotificationModel.create(notification);
    return this.toEntity(doc);
  }

  async findByUser(userId: string): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);
    return docs.map((doc) => this.toEntity(doc));
  }

  async markAsRead(id: string): Promise<void> {
    await NotificationModel.updateOne({ _id: id }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  private toEntity(doc: INotificationDoc): Notification {
    return new Notification(
      doc._id.toString(),
      doc.userId,
      doc.title,
      doc.message,
      doc.type as "INFO" | "SUCCESS" | "WARNING" | "ERROR",
      doc.link || "",
      doc.isRead,
      doc.createdAt,
    );
  }
}
