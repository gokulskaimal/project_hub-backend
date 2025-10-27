export interface ISendOtpUseCase {
    /**
     * Send OTP to email for verification
     */
    execute(email: string): Promise<{
        message: string;
        expiresAt: Date;
        attemptsRemaining: number;
    }>;
    /**
     * Resend OTP if previous one expired
     */
    resendOtp(email: string): Promise<{
        message: string;
        expiresAt: Date;
        attemptsRemaining: number;
    }>;
}
//# sourceMappingURL=ISendOtpUseCase%20.d.ts.map