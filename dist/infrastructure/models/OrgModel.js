"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const OrgSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, unique: true },
    planId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Plan" },
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
    settings: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
    features: [{ type: String }],
    timezone: { type: String, default: "UTC" },
    locale: { type: String, default: "en" },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
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
    customFields: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
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
    integrations: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
    usage: {
        storageUsed: { type: Number, default: 0 },
        storageLimit: Number,
        apiCallsUsed: { type: Number, default: 0 },
        apiCallsLimit: Number,
        lastResetAt: Date,
    },
    metadata: { type: mongoose_1.default.Schema.Types.Mixed, default: {} },
}, {
    timestamps: true, // ✅ AUTO-CREATES createdAt and updatedAt
    collection: "organizations",
});
OrgSchema.index({ status: 1 });
OrgSchema.index({ planId: 1 });
OrgSchema.index({ createdBy: 1 });
OrgSchema.index({ isDeleted: 1 });
exports.default = mongoose_1.default.model("Organization", OrgSchema);
//# sourceMappingURL=OrgModel.js.map