import mongoose, { Schema, Document } from "mongoose";
import { Task, TimeLog } from "../../domain/entities/Task";

export interface ITaskDoc extends Omit<Task, "id">, Document {}

const TimeLogSchema = new Schema<TimeLog>({
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
});

const AttachmentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number },
  type: { type: String },
});

const TaskCommentSchema = new Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TaskDependencySchema = new Schema(
  {
    taskId: { type: String, required: true },
    type: {
      type: String,
      enum: ["BLOCKS", "IS_BLOCKED_BY", "RELATES_TO"],
      required: true,
    },
  },
  { _id: false },
);

const TaskSchema = new Schema<ITaskDoc>(
  {
    projectId: { type: String, required: true, index: true },
    orgId: { type: String, required: true },
    taskKey: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BACKLOG"],
      default: "TODO",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    type: { type: String, enum: ["STORY", "BUG", "TASK"], default: "STORY" },
    parentTaskId: { type: String },
    dependencies: [TaskDependencySchema],
    storyPoints: { type: Number, default: 0 },
    sprintId: { type: String, default: null, index: true },
    sprintAssignedAt: { type: Date },
    assignedTo: { type: String, index: true },
    dueDate: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: String },
    timeLogs: [TimeLogSchema],
    totalTimeSpent: { type: Number, default: 0 },
    attachments: [AttachmentSchema],
    comments: [TaskCommentSchema],
  },
  { timestamps: true },
);

TaskSchema.index({ orgId: 1, createdAt: -1 });
TaskSchema.index({ orgId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });

TaskSchema.virtual("project", {
  ref: "Project",
  localField: "projectId",
  foreignField: "_id",
  justOne: true,
});

TaskSchema.set("toObject", { virtuals: true });
TaskSchema.set("toJSON", { virtuals: true });

export const TaskModel = mongoose.model<ITaskDoc>("Task", TaskSchema);
