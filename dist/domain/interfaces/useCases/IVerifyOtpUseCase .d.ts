export interface IVerifyOtpUseCase {
    /**
     * Verify OTP code
     */
    execute(email: string, otp: string): Promise<{
        valid: boolean;
        message: string;
        verified: boolean;
    }>;
    /**
     * Check OTP attempts remaining
     */
    getAttemptsRemaining(email: string): Promise<number>;
}
//# sourceMappingURL=IVerifyOtpUseCase%20.d.ts.map