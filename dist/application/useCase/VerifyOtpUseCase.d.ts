import { IVerifyOtpUseCase } from '../../domain/interfaces/useCases/IVerifyOtpUseCase ';
import { IUserRepo } from '../../domain/interfaces/IUserRepo';
import { ILogger } from '../../domain/interfaces/services/ILogger';
export declare class VerifyOtpUseCase implements IVerifyOtpUseCase {
    private readonly _userRepo;
    private readonly _logger;
    constructor(userRepo: IUserRepo, logger: ILogger);
    execute(email: string, otp: string): Promise<{
        valid: boolean;
        message: string;
        verified: boolean;
    }>;
    /**
     * ✅ ADDED: Check OTP attempts remaining - REQUIRED BY INTERFACE
     */
    getAttemptsRemaining(email: string): Promise<number>;
}
//# sourceMappingURL=VerifyOtpUseCase.d.ts.map