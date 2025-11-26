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
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED", "PENDING_VERIFICATION"],
      default: "PENDING_VERIFICATION",
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export type UserDocument = IUserDoc;

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;
