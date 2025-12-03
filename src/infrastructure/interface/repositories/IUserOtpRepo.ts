import { User } from "../../../domain/entities/User";

/**
 * User OTP Repository Interface
 * Handles all OTP-specific operations for users
 * @interface IUserOtpRepo
 */
export interface IUserOtpRepo {
  /**
   * Save OTP for user
   * @param email - User email
   * @param otp - OTP code
   * @param expiry - OTP expiration date
   */
  saveOtp(email: string, otp: string, expiry: Date): Promise<void>;

  /**
   * Store OTP for user (alias for saveOtp)
   * @param email - User email
   * @param otp - OTP code
   * @param expiry - OTP expiration date
   */
  storeOtp(email: string, otp: string, expiry: Date): Promise<void>;

  /**
   * Get OTP details for user
   * @param email - User email
   * @returns OTP details or null
   */
  getOtp(email: string): Promise<{ otp: string; expiresAt: Date } | null>;

  /**
   * Verify OTP for user
   * @param email - User email
   * @param otp - OTP code
   * @returns User if OTP is valid, null otherwise
   */
  verifyOtp(email: string, otp: string): Promise<User | null>;
}
