import { IResetPasswordUseCase } from "../interface/useCases/IResetPasswordUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { IEmailService } from "../../infrastructure/interface/services/IEmailService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
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