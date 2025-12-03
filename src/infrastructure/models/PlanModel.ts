import mongoose, { Schema, Document } from "mongoose";
import { Plan } from "../../domain/entities/Plan";

export interface IPlanDoc extends Document, Omit<Plan, "id"> {}

const planSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "inr" },
    features: [{ type: String }],
    type: {
      type: String,
      enum: ["STARTER", "PRO", "ENTERPRISE"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    razorpayPlanId: { type: String, required: true },
    limits: {
      projects: { type: Number, required: true, default: 1 },
      members: { type: Number, required: true, default: 5 },
      storage: { type: Number, required: true, default: 1 },
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPlanDoc>("Plan", planSchema);
