import mongoose, { Schema, Document } from "mongoose";
import { Subscription } from "../../domain/entities/Subscription";

export interface ISubscriptionDoc extends Document, Omit<Subscription, "id"> {}

const subscriptionSchema = new Schema(
  {
    userId: { type: String, required: true },
    planId: { type: String, required: true },
    razorpaySubscriptionId: { type: String, required: true, unique: true },
    razorpayCustomerId: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "active",
        "created",
        "authenticated",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "trialing",
        "unpaid",
      ],
      required: true,
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model<ISubscriptionDoc>(
  "Subscription",
  subscriptionSchema,
);
