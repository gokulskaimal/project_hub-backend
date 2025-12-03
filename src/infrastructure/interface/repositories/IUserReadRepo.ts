import { User } from "../../../domain/entities/User";
import { Organization } from "../../../domain/entities/Organization";

/**
 * User Read Repository Interface
 * Handles all read operations for users
 * @interface IUserReadRepo
 */
export interface IUserReadRepo {
  /**
   * Find user by email
   * @param email - User email
   * @returns User or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find users by organization ID
   * @param orgId - Organization ID
   * @returns Array of users in the organization
   */
  findByOrg(orgId: string): Promise<User[]>;

  /**
   * Find all users
   * @returns Array of all users
   */
  findAll(): Promise<User[]>;

  /**
   * Find users by role
   * @param role - User role
   * @returns Array of users with the role
   */
  findByRole(role: string): Promise<User[]>;

  /**
   * Find users by organization and role
   * @param orgId - Organization ID
   * @param role - User role
   * @returns Array of users
   */
  findByOrgAndRole(orgId: string, role: string): Promise<User[]>;

  /**
   * Find user by reset token
   * @param token - Reset token
   * @returns User or null if not found
   */
  findByResetToken(token: string): Promise<User | null>;

  /**
   * Find users with pagination
   * @param limit - Number of users to return
   * @param offset - Number of users to skip
   * @param searchTerm - Optional search term
   * @param filters - Optional filters
   * @returns Paginated users
   */
  findPaginated(
    limit: number,
    offset: number,
    searchTerm?: string,
    filters?: {
      orgId?: string;
      role?: string;
      status?: string;
      emailVerified?: boolean;
    },
  ): Promise<{
    users: User[];
    total: number;
    hasMore: boolean;
  }>;

  /**
   * Find users by status
   * @param status - User status
   * @returns Array of users with the status
   */
  findByStatus(status: string): Promise<User[]>;

  /**
   * Find users with expired OTP
   * @returns Array of users with expired OTP
   */
  findUsersWithExpiredOtp(): Promise<User[]>;

  /**
   * Count users by organization
   * @param orgId - Organization ID
   * @returns User count
   */
  countByOrg(orgId: string): Promise<number>;

  /**
   * Count users by role
   * @param role - User role
   * @returns User count
   */
  countByRole(role: string): Promise<number>;

  /**
   * Count total users
   * @returns Total user count
   */
  count(): Promise<number>;

  /**
   * Check if email exists (excluding specific user)
   * @param email - Email to check
   * @param excludeUserId - User ID to exclude from check
   * @returns Whether email exists
   */
  emailExists(email: string, excludeUserId?: string): Promise<boolean>;

  /**
   * @param orgId - Organization ID
   * @returns Organization or null
   */
  findOrganizationById?(orgId: string): Promise<Organization | null>;

  /**
   * Get user statistics
   * @returns User statistics
   */
  getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
  }>;
}
