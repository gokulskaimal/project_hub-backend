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
  maxManagers?: number;
  maxUsers?: number;
  currentUserCount?: number;
  industry?: string;
  size?: string;

  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };

  contact?: {
    email?: string;
    phone?: string;
    supportEmail?: string;
  };

  billing?: {
    billingEmail?: string;
    taxId?: string;
    currency?: string;
    paymentMethod?: string;
  };

  settings?: Record<string, unknown>;
  features?: string[];
  timezone?: string;
  locale?: string;
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

  // Additional fields
  customFields?: Record<string, unknown>;
  tags?: string[];
  priority?: string;

  onboardingStatus?: {
    completed: boolean;
    currentStep?: number;
    completedSteps?: number[];
    completedAt?: Date;
  };

  integrations?: Record<
    string,
    {
      enabled: boolean;
      config?: Record<string, unknown>;
      connectedAt?: Date;
    }
  >;

  usage?: {
    storageUsed?: number;
    storageLimit?: number;
    apiCallsUsed?: number;
    apiCallsLimit?: number;
    lastResetAt?: Date;
  };

  metadata?: Record<string, unknown>;
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

    // Limits
    maxManagers: { type: Number, default: 5 },
    maxUsers: { type: Number, default: 100 },
    currentUserCount: { type: Number, default: 0 },

    // Organization details
    industry: { type: String },
    size: {
      type: String,
      enum: ["STARTUP", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"],
    },

    // Nested objects
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    contact: {
      email: String,
      phone: String,
      supportEmail: String,
    },

    billing: {
      billingEmail: String,
      taxId: String,
      currency: { type: String, default: "USD" },
      paymentMethod: String,
    },

    // Flexible objects
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    features: [{ type: String }],
    timezone: { type: String, default: "UTC" },
    locale: { type: String, default: "en" },
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

    // Additional fields
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    tags: [{ type: String }],
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },

    onboardingStatus: {
      completed: { type: Boolean, default: false },
      currentStep: Number,
      completedSteps: [Number],
      completedAt: Date,
    },

    integrations: { type: mongoose.Schema.Types.Mixed, default: {} },
    usage: {
      storageUsed: { type: Number, default: 0 },
      storageLimit: Number,
      apiCallsUsed: { type: Number, default: 0 },
      apiCallsLimit: Number,
      lastResetAt: Date,
    },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
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
