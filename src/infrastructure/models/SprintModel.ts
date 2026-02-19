import mongoose, { Schema, Document } from "mongoose";
import { Sprint } from "../../domain/entities/Sprint";

export interface ISprintDoc extends Omit<Sprint, "id">, Document {}

const SprintSchema = new Schema<ISprintDoc>(
  {
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "PLANNED",
    },
    goal: { type: String },
  },
  { timestamps: true },
);

export const SprintModel = mongoose.model<ISprintDoc>("Sprint", SprintSchema);
