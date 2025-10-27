export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface IEmailService {
  sendEmail(payload: EmailPayload): Promise<void>;
  sendResetPasswordEmail(email: string, resetToken: string): Promise<void>;
}
