import mongoose, { Schema, Document } from "mongoose";
import { Meeting } from "../../domain/entities/Meeting";

export interface IMeetingDoc extends Omit<Meeting, "id">, Document {}

const MeetingSchema = new Schema<IMeetingDoc>(
  {
    sprintId: { type: String, required: true, index: true },
    projectId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["STANDUP", "REVIEW", "RETROSPECTIVE"],
      required: true,
    },
    roomId: { type: String, required: true, unique: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["SCHEDULED", "LIVE", "COMPLETED"],
      default: "SCHEDULED",
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const MeetingModel = mongoose.model<IMeetingDoc>(
  "Meeting",
  MeetingSchema,
);
