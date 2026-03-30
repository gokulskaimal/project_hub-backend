export interface IOtpService {
  /**
   * Generate OTP code
   * @param length - OTP length (default: 6)
   * @returns Generated OTP
   */
  generateOtp(length?: number): string;

  /**
   * Generate OTP expiry time
   * @param minutesFromNow - Minutes from current time (default: 10)
   * @returns Expiry date
   */
  generateExpiry(minutesFromNow?: number): Date;

  /**
   * Verify OTP
   * @param email - User email
   * @param otp - OTP to verify
   * @returns Whether OTP is valid
   */
  verifyOtp(email: string, otp: string): Promise<boolean>;

  /**
   * Store OTP temporarily
   * @param email - User email
   * @param otp - OTP code
   * @param expiresAt - Expiry time
   */
  storeOtp(email: string, otp: string, expiresAt: Date): Promise<void>;

  /**
   * Clear stored OTP
   * @param email - User email
   */
  clearOtp(email: string): Promise<void>;

  /**
   * Get OTP for a user
   * @param email - User email
   */
  getOtp(email: string): Promise<{ otp: string; expiresAt: Date } | null>;

  /**
   * Ensure user exists and has OTP (creates if not exists)
   */
  ensureUserWithOtp(email: string, otp: string, expiresAt: Date): Promise<void>;

  /**
   * Clean expired OTPs
   */
  cleanExpiredOtps(): Promise<number>;
}
