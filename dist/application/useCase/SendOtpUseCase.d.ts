import { ISendOtpUseCase } from '../../domain/interfaces/useCases/ISendOtpUseCase ';
import { IUserRepo } from '../../domain/interfaces/IUserRepo';
import { IOtpService } from '../../domain/interfaces/services/IOtpService ';
import { IEmailService } from '../../domain/interfaces/services/IEmailService ';
import { ILogger } from '../../domain/interfaces/services/ILogger';
export declare class SendOtpUseCase implements ISendOtpUseCase {
    private readonly _userRepo;
    private readonly _otpService;
    private readonly _emailService;
    private readonly _logger;
    constructor(userRepo: IUserRepo, otpService: IOtpService, emailService: IEmailService, logger: ILogger);
    /**
     * ✅ FIXED: Send OTP with correct return type
     */
    execute(email: string): Promise<{
        message: string;
        expiresAt: Date;
        attemptsRemaining: number;
    }>;
    /**
     * ✅ ADDED: Resend OTP if previous one expired
     */
    resendOtp(email: string): Promise<{
        message: string;
        expiresAt: Date;
        attemptsRemaining: number;
    }>;
    /**
     * Check rate limiting for OTP requests
     * @param email - User email
     * @returns Number of attempts remaining
     */
    private _checkRateLimit;
    /**
     * Update rate limiting counter
     * @param email - User email
     */
    private _updateRateLimit;
    /**
     * Validate email format
     * @param email - Email to validate
     * @returns Whether email is valid
     */
    private _isValidEmail;
}
//# sourceMappingURL=SendOtpUseCase.d.ts.map