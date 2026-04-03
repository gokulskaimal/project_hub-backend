import mongoose, { Document, Types } from "mongoose";
import { UserRole } from "../../domain/enums/UserRole";

export interface IUserDoc extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role: UserRole;
  provider?: string;
  googleId?: string;
  avatar?: string;
  orgId?: Types.ObjectId;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  otp?: string;
  otpExpiry: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  status?: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING_VERIFICATION";
  lastLoginAt?: Date;
}

const UserSchema = new mongoose.Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    password: { type: String },
    role: { type: String, enum: Object.values(UserRole), required: true },
    provider: { type: String, dafault: "local" },
    googleId: { type: String, index: true, unique: true, sparse: true },
    avatar: { type: String },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    otp: { type: String },
    otpExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING_VERIFICATION"],
      default: "PENDING_VERIFICATION",
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

// Optimize "Get All Organization Members" (filtering by role)
UserSchema.index({ orgId: 1, role: 1 });

// Optimize "Filter by Status"
UserSchema.index({ status: 1 });

// Optimize "Find by Email" (already unique, but ensuring it's explicit if needed)
// UserSchema.index({ email: 1 }, { unique: true }); // Mongoose handles this via schema definition

// Optimize "Find by Verification Token"
UserSchema.index({ otp: 1 });

UserSchema.index({ emailVerificationToken: 1 });

export type UserDocument = IUserDoc;

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;
