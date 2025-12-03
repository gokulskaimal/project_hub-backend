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
   * Update user password
   * @param id - User ID
   * @param hashedPassword - Hashed password
   */
  updatePassword(id: string, hashedPassword: string): Promise<void>;

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
   * Verify user email
   * @param id - User ID
   */
  verifyEmail(id: string): Promise<void>;

  /**
   * Set password reset token
   * @param email - User email
   * @param token - Reset token
   * @param expires - Token expiration date
   */
  setResetPasswordToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<void>;

  /**
   * Clear password reset token
   * @param id - User ID
   */
  clearResetPasswordToken(id: string): Promise<void>;

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

  /**
   * Ensure user exists with OTP (create if not exists, update if exists)
   * @param email - User email
   * @param otp - OTP code
   * @param expiry - OTP expiration date
   * @returns User with OTP
   */
  ensureUserWithOtp(email: string, otp: string, expiry: Date): Promise<User>;

  /**
   * Clean expired OTPs
   * @returns Number of cleaned OTPs
   */
  cleanExpiredOtps(): Promise<number>;
}
