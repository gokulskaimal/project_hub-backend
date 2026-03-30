import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    orgId: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED", "CANCELLED"],
      default: "PENDING",
    },
    expiry: { type: Date, required: true },
    role: { type: String, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("Invite", inviteSchema);
