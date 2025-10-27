export interface IResetPasswordUseCase {
    /**
     * Request password reset (send email with reset link)
     */
    requestReset(email: string): Promise<{
        message: string;
        token?: string;
    }>;
    /**
     * Reset password using token
     */
    resetWithToken(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    /**
     * Complete password reset process
     */
    completeReset(token: string, password: string): Promise<{
        message: string;
    }>;
    /**
     * Validate reset token
     */
    validateResetToken(token: string): Promise<boolean>;
}
//# sourceMappingURL=IResetPasswordUseCase%20.d.ts.map