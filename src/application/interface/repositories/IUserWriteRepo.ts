import { User } from "../../../domain/entities/User";

/**
 * User Write Repository Interface
 * Handles all write operations for users
 * @interface IUserWriteRepo
 */
export interface IUserWriteRepo {
  /**
   * Create new user
   * @param user - Partial user data
   * @returns Created user
   */
  create(user: Partial<User>): Promise<User>;

  /**
   * Update user
   * @param id - User ID
   * @param data - Partial user data to update
   * @returns Updated user
   */
  update(id: string, data: Partial<User>): Promise<User | null>;

  /**
   * Update user profile
   * @param id - User ID
   * @param data - Partial user data to update
   * @returns Updated user
   */
  updateProfile(id: string, data: Partial<User>): Promise<User>;

  /**
   * Update user status
   * @param id - User ID
   * @param status - New status
   * @returns Updated user
   */
  updateStatus(id: string, status: string): Promise<User>;

  /**
   * Update last login timestamp
   * @param id - User ID
   * @param loginTime - Login timestamp
   */
  updateLastLogin(id: string, loginTime: Date): Promise<void>;

  /**
   * Update user's reset token
   * @param email - User email
   * @param token - Reset token (or undefined to clear)
   * @param expiry - Token expiry date (or undefined to clear)
   */
  updateResetToken(
    email: string,
    token: string | undefined,
    expiry: Date | undefined,
  ): Promise<void>;

  /**
   * Update user's password
   * @param email - User email
   * @param passwordHash - New hashed password
   */
  updatePassword(email: string, passwordHash: string): Promise<void>;

  /**
   * Update user's OTP
   * @param email - User email
   * @param otp - OTP code
   * @param expiry - OTP expiry date
   */
  updateOtp(email: string, otp: string, expiry: Date): Promise<void>;

  /**
   * Clear user's OTP
   * @param email - User email
   */
  clearOtp(email: string): Promise<void>;

  /**
   * Upsert OTP user data
   * @param email - User email
   * @param data - Data to upsert
   */
  upsertOtpUser(email: string, data: Record<string, unknown>): Promise<void>;

  /**
   * Clean up expired OTPs
   * @returns Number of deleted OTPs
   */
  cleanExpiredOtps(): Promise<number>;

  /**
   * Verify user email
   * @param id - User ID
   */
  verifyEmail(id: string): Promise<void>;

  /**
   * Delete user (soft delete)
   * @param id - User ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Remove user from organization
   * @param userId - User ID
   * @param orgId - Organization ID
   */
  removeFromOrg(userId: string, orgId: string): Promise<void>;

  /**
   * Update last login timestamp
   * @param id - User ID
   * @param loginTime - Login timestamp
   */
  updateLastLogin(id: string, loginTime: Date): Promise<void>;
}
