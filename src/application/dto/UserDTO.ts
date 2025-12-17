import { User } from "../../domain/entities/User";

export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  orgId?: string | null;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  profileComplete?: boolean;
  organizationName?: string;
  avatar?: string | null;
}

/**
 * Convert domain User entity to UserDTO (safe for API responses)
 */
export function toUserDTO(user: User & { organizationName?: string }): UserDTO {
  const toIso = (d?: Date | string | undefined): string | undefined =>
    d ? new Date(d).toISOString() : undefined;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar ?? null,
    role: user.role,
    orgId: user.orgId ?? null,
    organizationName: user.organizationName,
    emailVerified: Boolean(user.emailVerified),
    emailVerifiedAt: toIso(user.emailVerifiedAt),
    status: user.status,
    createdAt: toIso(user.createdAt) as string,
    updatedAt: toIso(user.updatedAt),
    lastLoginAt: toIso(user.lastLoginAt),
    profileComplete: Boolean(user.firstName && user.lastName),
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
