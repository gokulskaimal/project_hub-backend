import { IEmailService } from "../interface/services/IEmailService";
import { ILogger } from "../interface/services/ILogger";
/**
 * Email Service Implementation
 * Provides email sending capabilities using NodeMailer
 */
export declare class EmailService implements IEmailService {
    private readonly _logger;
    private transporter;
    constructor(_logger: ILogger);
    private renderTemplate;
    sendEmail(payload: {
        to: string;
        subject: string;
        text: string;
        html?: string;
    }): Promise<void>;
    sendWelcomeEmail(email: string, name: string, verificationCode?: string): Promise<void>;
    sendResetPasswordEmail(email: string, resetToken: string): Promise<void>;
    sendInviteEmail(email: string, inviteToken: string, orgName: string, inviterName: string): Promise<void>;
    sendOtpEmail(email: string, otp: string, purpose?: string): Promise<void>;
    sendVerificationEmail(email: string, name: string, verificationCode: string): Promise<void>;
}
//# sourceMappingURL=EmailService.d.ts.map