import mongoose, { Schema, Document } from "mongoose";
import { TaskHistory } from "../../domain/entities/TaskHistory";

export interface ITaskHistoryDoc extends Omit<TaskHistory, "id">, Document {}

const TaskHistorySchema = new Schema<ITaskHistoryDoc>(
  {
    taskId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    action: {
      type: String,
      enum: [
        "CREATED",
        "STATUS_CHANGED",
        "ASSIGNEE_CHANGED",
        "SPRINT_CHANGED",
        "UPDATED",
      ],
      required: true,
    },
    details: { type: String },
    previousValue: { type: String },
    newValue: { type: String },
  },
  { timestamps: true },
);

TaskHistorySchema.set("toObject", { virtuals: true });
TaskHistorySchema.set("toJSON", { virtuals: true });

export const TaskHistoryModel = mongoose.model<ITaskHistoryDoc>(
  "TaskHistory",
  TaskHistorySchema,
);
