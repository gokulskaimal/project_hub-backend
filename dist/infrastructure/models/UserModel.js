"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserRole_1 = require("../../domain/enums/UserRole");
const UserSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    password: { type: String },
    role: { type: String, enum: Object.values(UserRole_1.UserRole), required: true },
    provider: { type: String, dafault: "local" },
    googleId: { type: String, index: true, unique: true, sparse: true },
    avatar: { type: String },
    orgId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Organization" },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    otp: { type: String },
    otpExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING_VERIFICATION"],
        default: "PENDING_VERIFICATION",
    },
    lastLoginAt: { type: Date },
}, { timestamps: true });
// Optimize "Get All Organization Members" (filtering by role)
UserSchema.index({ orgId: 1, role: 1 });
// Optimize "Filter by Status"
UserSchema.index({ status: 1 });
// Optimize "Find by Email" (already unique, but ensuring it's explicit if needed)
// UserSchema.index({ email: 1 }, { unique: true }); // Mongoose handles this via schema definition
// Optimize "Find by Verification Token"
UserSchema.index({ otp: 1 });
exports.UserModel = mongoose_1.default.model("User", UserSchema);
exports.default = exports.UserModel;
//# sourceMappingURL=UserModel.js.map