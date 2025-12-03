import { ISendOtpUseCase } from "../interface/useCases/ISendOtpUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOtpService } from "../../infrastructure/interface/services/IOtpService";
import { IEmailService } from "../../infrastructure/interface/services/IEmailService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ICacheService } from "../../infrastructure/interface/services/ICacheService";
export declare class SendOtpUseCase implements ISendOtpUseCase {
    private readonly _userRepo;
    private readonly _otpService;
    private readonly _emailService;
    private readonly _logger;
    private readonly _cache;
    constructor(_userRepo: IUserRepo, _otpService: IOtpService, _emailService: IEmailService, _logger: ILogger, _cache: ICacheService);
    /**
     * Send OTP
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
    /**
     * Check rate limiting for OTP requests
     * @param email - User email
     * @returns Number of attempts remaining
     */
    private _checkRateLimit;
    /**
     * Validate email format
     * @param email - Email to validate
     * @returns Whether email is valid
     */
    private _isValidEmail;
}
//# sourceMappingURL=SendOtpUseCase.d.ts.map