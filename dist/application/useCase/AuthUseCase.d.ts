import { IAuthUseCases } from "../../domain/interfaces/useCases/IAuthUseCases";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
import { IResetPasswordUseCase } from "../../domain/interfaces/useCases/IResetPasswordUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { UserDTO } from "../dto/UserDTO";
import { AuthResult, AuthTokens } from "../../domain/interfaces/useCases/types";
export declare class AuthUseCases implements IAuthUseCases {
    private readonly _userRepo;
    private readonly _hashService;
    private readonly _jwtService;
    private readonly _resetPasswordUseCase;
    private readonly _logger;
    private readonly _orgRepo;
    constructor(_userRepo: IUserRepo, _hashService: IHashService, _jwtService: IJwtService, _resetPasswordUseCase: IResetPasswordUseCase, _logger: ILogger, _orgRepo: IOrgRepo);
    /**
     * Helper: normalize args for login
     */
    private normalizeLoginArgs;
    private normalizeRegisterArgs;
    /**
     * REGISTER
     * Creates a new user, hashes password, returns a public user view and tokens.
     */
    register(email: string, password: string, name?: string): Promise<AuthResult>;
    /**
     * LOGIN - accepts either (email, password) or {email, password}
     * Returns shape expected by controller: { user, accessToken, refreshToken }
     */
    login(email: string, password: string): Promise<AuthResult>;
    /**
     * REFRESH - accept refresh token string or object
     * Returns new access token (and optionally new refresh token if your jwtService rotates)
     */
    refresh(refreshToken: string): Promise<AuthTokens>;
    /**
     * LOGOUT - revoke refresh token if service supports revocation
     */
    logout(refreshToken?: string, userId?: string): Promise<void>;
    /**
     * Validate access token and return safe user DTO
     */
    validateToken(token: string): Promise<UserDTO>;
    /**
     * Password reset delegations
     */
    resetPasswordReq(email: string): Promise<{
        message: string;
        token?: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    /**
     * Verify email token (assumes token payload contains id)
     */
    verifyEmail(token: string): Promise<{
        message: string;
        verified: boolean;
    }>;
    refreshToken(refreshToken: string): Promise<AuthTokens>;
}
//# sourceMappingURL=AuthUseCase.d.ts.map