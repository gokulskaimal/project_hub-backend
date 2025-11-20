import { UserRole } from "../enums/UserRole";

/**
 * Enhanced User Entity
 * Supports all user operations and tracking needed by DI Use Cases
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role: UserRole;
  provider?: string;
  googleId?: string;
  avatar?: string;
  orgId?: string;
  otp?: string;
  otpExpiry?: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  status:
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "PENDING_VERIFICATION"
    | "PENDING_APPROVAL";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
