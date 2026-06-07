export interface IVerifyOtpUseCase {
  /**
   * Verify OTP code
   */
  execute(
    email: string,
    otp: string,
  ): Promise<{
    valid: boolean;
    message: string;
    verified: boolean;
    signupToken?: string;
  }>;

  /**
   * Check OTP attempts remaining
   */
  getAttemptsRemaining(email: string): Promise<number>;
}
