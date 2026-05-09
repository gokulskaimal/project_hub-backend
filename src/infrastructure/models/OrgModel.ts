import mongoose, { Document, Types } from "mongoose";

export interface IOrgDOc extends Document {
  _id: Types.ObjectId;
  name: string;
  planId?: Types.ObjectId;

  status?: string;
  createdAt: Date;
  updatedAt: Date;

  displayName?: string;
  description?: string;
  logo?: string;
  website?: string;
  subscriptionStatus?: string;
  razorpaySubscriptionId?: string;
  maxManagers?: number;
  maxUsers?: number;
  industry?: string;
  size?: string;

  createdBy?: Types.ObjectId | string;

  // Trial & Subscription dates
  trialStartsAt?: Date;
  trialEndsAt?: Date;
  subscriptionStartsAt?: Date;
  subscriptionEndsAt?: Date;
  lastActivityAt?: Date;

  // Soft delete
  isDeleted?: boolean;
  deletedAt?: Date;
  deletionReason?: string;
}

const OrgSchema = new mongoose.Schema<IOrgDOc>(
  {
    name: { type: String, required: true, unique: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
        "PENDING_APPROVAL",
        "TRIAL",
        "EXPIRED",
      ],
      default: "ACTIVE",
    },

    // Basic information
    displayName: { type: String },
    description: { type: String },
    logo: { type: String },
    website: { type: String },

    // Subscription info
    subscriptionStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "TRIAL", "EXPIRED", "CANCELLED"],
    },
    razorpaySubscriptionId: { type: String },

    // Limits
    maxManagers: { type: Number, default: 5 },
    maxUsers: { type: Number, default: 100 },

    // Organization details
    industry: { type: String },
    size: {
      type: String,
      enum: ["STARTUP", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"],
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Date fields
    trialStartsAt: Date,
    trialEndsAt: Date,
    subscriptionStartsAt: Date,
    subscriptionEndsAt: Date,
    lastActivityAt: Date,

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletionReason: String,
  },
  {
    timestamps: true, // ✅ AUTO-CREATES createdAt and updatedAt
    collection: "organizations",
  },
);

OrgSchema.index({ status: 1 });
OrgSchema.index({ planId: 1 });
OrgSchema.index({ createdBy: 1 });
OrgSchema.index({ isDeleted: 1 });

export default mongoose.model<IOrgDOc>("Organization", OrgSchema);
