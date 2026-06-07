import mongoose, { Schema, Document } from "mongoose";
import { Project } from "../../domain/entities/Project";

export interface IProjectDoc extends Omit<Project, "id">, Document {}

const ProjectSchema = new Schema<IProjectDoc>(
  {
    orgId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED", "COMPLETED", "PLANNING", "ON_HOLD"],
      default: "PLANNING",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    tags: [{ type: String }],
    teamMemberIds: [{ type: String }], // Array of User IDs
    tasksPerWeek: { type: Number, default: 25, min: 1 },
    taskSequence: { type: Number, default: 0 },
    key: { type: String },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    progress: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ProjectModel = mongoose.model<IProjectDoc>(
  "Project",
  ProjectSchema,
);
