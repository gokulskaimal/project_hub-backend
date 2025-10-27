import { IResetPasswordUseCase } from '../../domain/interfaces/useCases/IResetPasswordUseCase ';
import { IUserRepo } from '../../domain/interfaces/IUserRepo';
import { IHashService } from '../../domain/interfaces/services/IHashService ';
import { IJwtService } from '../../domain/interfaces/services/IJwtService ';
import { IEmailService } from '../../domain/interfaces/services/IEmailService ';
import { ILogger } from '../../domain/interfaces/services/ILogger';
export declare class ResetPasswordUseCase implements IResetPasswordUseCase {
    private readonly _userRepo;
    private readonly _hashService;
    private readonly _jwtService;
    private readonly _emailService;
    private readonly _logger;
    constructor(userRepo: IUserRepo, hashService: IHashService, jwtService: IJwtService, emailService: IEmailService, logger: ILogger);
    /**
     * ✅ ADDED: Request password reset (send email with reset link)
     */
    requestReset(email: string): Promise<{
        message: string;
        token?: string;
    }>;
    /**
     * ✅ ADDED: Reset password using token
     */
    resetWithToken(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    /**
     * ✅ ADDED: Complete password reset process
     */
    completeReset(token: string, password: string): Promise<{
        message: string;
    }>;
    /**
     * ✅ ADDED: Validate reset token
     */
    validateResetToken(token: string): Promise<boolean>;
    /**
     * Validate password strength
     * @param password - Password to validate
     */
    private _validatePassword;
}
//# sourceMappingURL=ResetPasswordUseCase.d.ts.map