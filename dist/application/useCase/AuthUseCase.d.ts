import { IAuthUseCases } from '../../domain/interfaces/useCases/IAuthUseCases ';
import { IUserRepo } from '../../domain/interfaces/IUserRepo';
import { IHashService } from '../../domain/interfaces/services/IHashService ';
import { IJwtService } from '../../domain/interfaces/services/IJwtService ';
import { IResetPasswordUseCase } from '../../domain/interfaces/useCases/IResetPasswordUseCase ';
import { ILogger } from '../../domain/interfaces/services/ILogger';
export declare class AuthUseCases implements IAuthUseCases {
    private readonly _userRepo;
    private readonly _hashService;
    private readonly _jwtService;
    private readonly _resetPasswordUseCase;
    private readonly _logger;
    constructor(userRepo: IUserRepo, hashService: IHashService, jwtService: IJwtService, resetPasswordUseCase: IResetPasswordUseCase, logger: ILogger);
    login(email: string, password: string): Promise<{
        user: any;
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    logout(userId: string, refreshToken: string): Promise<void>;
    validateToken(token: string): Promise<any>;
    /**
     * ✅ ADDED: Request password reset - REQUIRED BY AuthController
     */
    resetPasswordReq(email: string): Promise<{
        message: string;
        token?: string;
    }>;
    /**
     * ✅ ADDED: Reset password with token - REQUIRED BY AuthController
     */
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    /**
     * ✅ ADDED: Verify email - REQUIRED BY AuthController
     */
    verifyEmail(token: string): Promise<{
        message: string;
        verified: boolean;
    }>;
}
//# sourceMappingURL=AuthUseCase.d.ts.map