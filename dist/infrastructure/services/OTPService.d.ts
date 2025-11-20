import { IOtpService } from "../../domain/interfaces/services/IOtpService";
/**
 * OTP Service Implementation
 * Provides OTP generation, storage, and verification
 */
export declare class OtpService implements IOtpService {
    private otpStore;
    private cleanupInterval;
    constructor();
    /**
     * Generate a random OTP
     * @param length - Length of OTP (default: 6)
     * @returns Generated OTP string
     */
    generateOtp(length?: number): string;
    /**
     * Generate expiry date for OTP
     * @param minutesFromNow - Minutes from now (default: 10)
     * @returns Expiry date
     */
    generateExpiry(minutesFromNow?: number): Date;
    /**
     * Verify OTP for a given email
     * @param email - User email
     * @param otp - OTP to verify
     * @returns Whether OTP is valid
     */
    verifyOtp(email: string, otp: string): boolean;
    /**
     * Store OTP for a given email
     * @param email - User email
     * @param otp - OTP to store
     * @param expiresAt - Expiration date
     */
    storeOtp(email: string, otp: string, expiresAt: Date): void;
    /**
     * Clear OTP for a given email
     * @param email - User email
     */
    clearOtp(email: string): void;
    /**
     * Check if OTP exists for email (without revealing the OTP)
     * @param email - User email
     * @returns Whether OTP exists and is not expired
     */
    hasValidOtp(email: string): boolean;
    /**
     * Get OTP expiry time for email
     * @param email - User email
     * @returns Expiry timestamp or null if no OTP
     */
    getOtpExpiry(email: string): Date | null;
    /**
     * Generate and store OTP for email
     * @param email - User email
     * @param length - OTP length
     * @param expiryMinutes - Minutes until expiry
     * @returns Generated OTP
     */
    generateAndStoreOtp(email: string, length?: number, expiryMinutes?: number): string;
    /**
     * Get statistics about stored OTPs
     * @returns OTP statistics
     */
    getStats(): {
        total: number;
        expired: number;
        valid: number;
    };
    /**
     * Clean up expired OTPs from memory
     * @returns Number of cleaned up OTPs
     */
    private cleanupExpiredOtps;
    /**
     * Clear all OTPs (useful for testing)
     */
    clearAll(): void;
    /**
     * Destroy service and cleanup intervals
     */
    destroy(): void;
}
//# sourceMappingURL=OTPService.d.ts.map