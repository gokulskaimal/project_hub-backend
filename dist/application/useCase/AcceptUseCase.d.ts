import { OrganizationStatus } from "../../domain/entities/Organization";
import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IAcceptUseCase } from "../../domain/interfaces/useCases/IAcceptUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
export declare class AcceptUseCase implements IAcceptUseCase {
    private readonly _inviteRepo;
    private readonly _userRepo;
    private readonly _logger;
    private readonly _hashService;
    private readonly _jwtService;
    constructor(inviteRepo: IInviteRepo, userRepo: IUserRepo, logger: ILogger, hashService: IHashService, jwtService: IJwtService);
    /**
     * ✅ FIXED: Execute invitation acceptance with correct signature
     * @param token - Invitation token
     * @param password - User's chosen password
     * @param firstName - User's first name
     * @param lastName - User's last name
     * @param additionalData - Optional additional data
     * @returns User, organization, and tokens
     */
    execute(token: string, password: string, firstName: string, lastName: string, additionalData?: Record<string, unknown>): Promise<{
        user: Record<string, unknown>;
        organization: {
            id: string;
            name: string;
            status: OrganizationStatus;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
        };
    }>;
    /**
     * @param token - Invitation token
     * @returns Validation result
     */
    validateInvitationToken(token: string): Promise<{
        valid: boolean;
        invitation?: Record<string, unknown>;
        expired?: boolean;
        cancelled?: boolean;
        accepted?: boolean;
    }>;
    /**
     * Validate password strength
     * @param password - Password to validate
     */
    private _validatePassword;
}
//# sourceMappingURL=AcceptUseCase.d.ts.map