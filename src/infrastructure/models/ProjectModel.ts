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
      enum: ["ACTIVE", "ARCHIVED", "COMPLETED"],
      default: "ACTIVE",
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
    taskSequence: { type: Number, default: 0 },
    key: { type: String },
  },
  { timestamps: true },
);

export const ProjectModel = mongoose.model<IProjectDoc>(
  "Project",
  ProjectSchema,
);
