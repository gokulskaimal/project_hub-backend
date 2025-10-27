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
    verifyOtp(email: string, otp: string): boolean;
    /**
     * Store OTP temporarily
     * @param email - User email
     * @param otp - OTP code
     * @param expiresAt - Expiry time
     */
    storeOtp(email: string, otp: string, expiresAt: Date): void;
    /**
     * Clear stored OTP
     * @param email - User email
     */
    clearOtp(email: string): void;
}
//# sourceMappingURL=IOtpService%20.d.ts.map