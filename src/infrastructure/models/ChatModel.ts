import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessageDoc extends Document {
  projectId: string;
  senderId: string;
  content: string;
  type: "TEXT" | "FILE" | "IMAGE" | "SYSTEM" | "ACTIVITY";
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
    type: {
      type: String,
      enum: ["TEXT", "FILE", "IMAGE", "SYSTEM", "ACTIVITY"],
      default: "TEXT",
    },
    fileUrl: { type: String, default: null },
  },
  { timestamps: true },
);

// TTL Index for 30 days retention policy (2592000 seconds)
ChatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const ChatModel = mongoose.model<IChatMessageDoc>(
  "ChatMessage",
  ChatSchema,
);
