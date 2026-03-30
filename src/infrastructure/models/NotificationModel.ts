import mongoose, { Schema, Document } from "mongoose";

export interface INotificationDoc extends Document {
  userId: string;
  orgId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    orgId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "ERROR"],
      default: "INFO",
    },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationModel = mongoose.model<INotificationDoc>(
  "Notification",
  NotificationSchema,
);
