/* eslint-disable @typescript-eslint/no-explicit-any */
import { User } from "../../domain/entities/User";

export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  orgId?: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  joinedAt?: Date;
  avatar?: string;
  phone?: string;
  phoneVerified?: boolean;
  timezone?: string;
  language?: string;
  title?: string;
  department?: string;
  bio?: string;
  dateOfBirth?: Date;

  // Profile completion indicators
  profileComplete?: boolean;
  hasPassword?: boolean;
}

/**
 * Convert User entity to UserDTO (safe for API responses)
 * @param user - User domain entity
 * @returns UserDTO without sensitive data
 */
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    orgId: user.orgId,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    joinedAt: user.joinedAt,
    avatar: user.avatar,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    timezone: user.timezone,
    language: user.language,
    title: user.title,
    department: user.department,
    bio: user.bio,
    dateOfBirth: user.dateOfBirth,

    // Derived fields
    profileComplete: !!(user.firstName && user.lastName && user.phone),
    hasPassword: !!user.password && user.password.length > 0,
  };
}

/**
 * Login Request DTO
 */
export interface LoginRequestDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login Response DTO
 */
export interface LoginResponseDTO {
  user: UserDTO;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  organization?: {
    id: string;
    name: string;
    status: string;
  };
}

/**
 * Registration Request DTO
 */
export interface RegisterRequestDTO {
  email: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
}

/**
 * Update Profile Request DTO
 */
export interface UpdateProfileRequestDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  title?: string;
  department?: string;
  bio?: string;
  dateOfBirth?: Date;
  preferences?: Record<string, any>;
}

/**
 * Change Password Request DTO
 */
export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * Reset Password Request DTO
 */
export interface ResetPasswordRequestDTO {
  email: string;
}

/**
 * Complete Reset Password DTO
 */
export interface CompleteResetPasswordDTO {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * OTP Request DTO
 */
export interface OTPRequestDTO {
  email: string;
}

/**
 * OTP Verification DTO
 */
export interface OTPVerificationDTO {
  email: string;
  otp: string;
}

/**
 * Complete Signup DTO
 */
export interface CompleteSignupDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptedTerms: boolean;
}

/**
 * Invite Member DTO
 */
export interface InviteMemberDTO {
  email: string;
  role?: string;
  message?: string;
}

/**
 * Accept Invitation DTO
 */
export interface AcceptInvitationDTO {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Bulk Invite DTO
 */
export interface BulkInviteDTO {
  emails: string[];
  role?: string;
  message?: string;
}

/**
 * User Search/Filter DTO
 */
export interface UserSearchDTO {
  searchTerm?: string;
  role?: string;
  status?: string;
  orgId?: string;
  emailVerified?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "name" | "lastLoginAt" | "email";
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated Users Response DTO
 */
export interface PaginatedUsersDTO {
  users: UserDTO[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters?: UserSearchDTO;
}

/**
 * User Statistics DTO
 */
export interface UserStatsDTO {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  verified: number;
  unverified: number;
  byRole: Record<string, number>;
  byOrganization: Record<string, number>;
  recentSignups: number;
  lastWeekSignups: number;
  lastMonthSignups: number;
}
