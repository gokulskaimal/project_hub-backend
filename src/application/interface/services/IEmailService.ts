export interface IEmailService {
  /**
   * Send basic email
   * @param payload - Email payload
   */
  sendEmail(payload: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void>;

  /**
   * Send welcome email
   * @param email - Recipient email
   * @param name - User name
   * @param verificationCode - Email verification code (optional)
   */
  sendWelcomeEmail(
    email: string,
    name: string,
    verificationCode?: string,
  ): Promise<void>;

  /**
   * Send password reset email
   * @param email - Recipient email
   * @param resetToken - Password reset token
   */
  sendResetPasswordEmail(email: string, resetToken: string): Promise<void>;

  /**
   * Send invitation email
   * @param email - Recipient email
   * @param inviteToken - Invitation token
   * @param orgName - Organization name
   * @param inviterName - Inviter name
   */
  sendInviteEmail(
    email: string,
    inviteToken: string,
    orgName: string,
    inviterName: string,
  ): Promise<void>;

  /**
   * Send OTP email
   * @param email - Recipient email
   * @param otp - OTP code
   * @param purpose - Purpose of OTP (registration, verification, etc.)
   */
  sendOtpEmail(email: string, otp: string, purpose?: string): Promise<void>;

  /**
   * Send email verification
   * @param email - Recipient email
   * @param name - User name
   * @param verificationCode - Verification code
   */
  sendVerificationEmail(
    email: string,
    name: string,
    verificationCode: string,
  ): Promise<void>;
}
