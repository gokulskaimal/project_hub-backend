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
    orgId?: string;
    otp?: string;
    otpExpiry?: Date;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "PENDING_APPROVAL";
    avatar?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt?: Date;
    lastLoginAt?: Date;
    joinedAt?: Date;
    signupMethod?: "REGISTRATION" | "INVITATION" | "INVITATION_VERIFIED" | "ADMIN_CREATED";
    invitedAt?: Date;
    invitedBy?: string;
    phone?: string;
    phoneVerified?: boolean;
    timezone?: string;
    language?: string;
    title?: string;
    department?: string;
    bio?: string;
    dateOfBirth?: Date;
    preferences?: {
        emailNotifications?: boolean;
        pushNotifications?: boolean;
        marketingEmails?: boolean;
        theme?: "light" | "dark" | "auto";
        [key: string]: any;
    };
    permissions?: string[];
    failedLoginAttempts?: number;
    lockedAt?: Date;
    lockExpiresAt?: Date;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    backupCodes?: string[];
    sessionTokens?: string[];
    tosAcceptedAt?: Date;
    privacyAcceptedAt?: Date;
    registrationIp?: string;
    registrationUserAgent?: string;
    lastKnownIp?: string;
    isDeleted?: boolean;
    deletedAt?: Date;
    deletionReason?: string;
    metadata?: Record<string, any>;
}
//# sourceMappingURL=User.d.ts.map