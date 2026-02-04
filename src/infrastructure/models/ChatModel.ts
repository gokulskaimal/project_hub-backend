import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessageDoc extends Document {
  projectId: string;
  senderId: string;
  content: string;
  type: "TEXT" | "FILE" | "IMAGE";
  fileUrl: string | null;
  createdAt: Date;
}

const ChatSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["TEXT", "FILE", "IMAGE"], default: "TEXT" },
    fileUrl: { type: String, default: null },
  },
  { timestamps: true },
);

export const ChatModel = mongoose.model<IChatMessageDoc>(
  "ChatMessage",
  ChatSchema,
);
