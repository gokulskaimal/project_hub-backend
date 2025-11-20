import { injectable } from "inversify";
import { IOtpService } from "../../domain/interfaces/services/IOtpService";

/**
 * OTP Service Implementation
 * Provides OTP generation, storage, and verification
 */
@injectable()
export class OtpService implements IOtpService {
  // In-memory storage for OTPs (use Redis in production)
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  // Cleanup interval to remove expired OTPs
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired OTPs every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredOtps();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Generate a random OTP
   * @param length - Length of OTP (default: 6)
   * @returns Generated OTP string
   */
  generateOtp(length: number = 6): string {
    if (length < 4 || length > 10) {
      throw new Error("OTP length must be between 4 and 10");
    }

    // Generate random number with specified length
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;

    return otp.toString();
  }

  /**
   * Generate expiry date for OTP
   * @param minutesFromNow - Minutes from now (default: 10)
   * @returns Expiry date
   */
  generateExpiry(minutesFromNow: number = 10): Date {
    if (minutesFromNow <= 0 || minutesFromNow > 60) {
      throw new Error("OTP expiry must be between 1 and 60 minutes");
    }

    return new Date(Date.now() + minutesFromNow * 60 * 1000);
  }

  /**
   * Verify OTP for a given email
   * @param email - User email
   * @param otp - OTP to verify
   * @returns Whether OTP is valid
   */
  verifyOtp(email: string, otp: string): boolean {
    if (!email || !otp) {
      return false;
    }

    const record = this.otpStore.get(email.toLowerCase());

    if (!record) {
      return false;
    }

    // Check if OTP is expired
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(email.toLowerCase());
      return false;
    }

    // Check if OTP matches
    const isValid = record.otp === otp.toString();

    // Remove OTP after verification (one-time use)
    if (isValid) {
      this.otpStore.delete(email.toLowerCase());
    }

    return isValid;
  }

  /**
   * Store OTP for a given email
   * @param email - User email
   * @param otp - OTP to store
   * @param expiresAt - Expiration date
   */
  storeOtp(email: string, otp: string, expiresAt: Date): void {
    if (!email || !otp) {
      throw new Error("Email and OTP are required");
    }

    if (expiresAt <= new Date()) {
      throw new Error("Expiry date must be in the future");
    }

    this.otpStore.set(email.toLowerCase(), {
      otp: otp.toString(),
      expiresAt: expiresAt.getTime(),
    });
  }

  /**
   * Clear OTP for a given email
   * @param email - User email
   */
  clearOtp(email: string): void {
    if (email) {
      this.otpStore.delete(email.toLowerCase());
    }
  }

  /**
   * Check if OTP exists for email (without revealing the OTP)
   * @param email - User email
   * @returns Whether OTP exists and is not expired
   */
  hasValidOtp(email: string): boolean {
    if (!email) return false;

    const record = this.otpStore.get(email.toLowerCase());

    if (!record) return false;

    // Check if expired
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(email.toLowerCase());
      return false;
    }

    return true;
  }

  /**
   * Get OTP expiry time for email
   * @param email - User email
   * @returns Expiry timestamp or null if no OTP
   */
  getOtpExpiry(email: string): Date | null {
    if (!email) return null;

    const record = this.otpStore.get(email.toLowerCase());

    if (!record) return null;

    return new Date(record.expiresAt);
  }

  /**
   * Generate and store OTP for email
   * @param email - User email
   * @param length - OTP length
   * @param expiryMinutes - Minutes until expiry
   * @returns Generated OTP
   */
  generateAndStoreOtp(
    email: string,
    length: number = 6,
    expiryMinutes: number = 10,
  ): string {
    const otp = this.generateOtp(length);
    const expiry = this.generateExpiry(expiryMinutes);

    this.storeOtp(email, otp, expiry);

    return otp;
  }

  /**
   * Get statistics about stored OTPs
   * @returns OTP statistics
   */
  getStats(): { total: number; expired: number; valid: number } {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const [, record] of this.otpStore) {
      if (record.expiresAt < now) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.otpStore.size,
      expired,
      valid,
    };
  }

  /**
   * Clean up expired OTPs from memory
   * @returns Number of cleaned up OTPs
   */
  private cleanupExpiredOtps(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [email, record] of this.otpStore) {
      if (record.expiresAt < now) {
        this.otpStore.delete(email);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
    }

    return cleanedCount;
  }

  /**
   * Clear all OTPs (useful for testing)
   */
  clearAll(): void {
    this.otpStore.clear();
  }

  /**
   * Destroy service and cleanup intervals
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearAll();
  }
}
