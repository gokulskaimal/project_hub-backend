import { OrganizationStatus } from "../../domain/entities/Organization";
import { IInviteRepo } from "../../infrastructure/interface/repositories/IInviteRepo";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IAcceptUseCase } from "../interface/useCases/IAcceptUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
export declare class AcceptUseCase implements IAcceptUseCase {
    private readonly _inviteRepo;
    private readonly _userRepo;
    private readonly _logger;
    private readonly _hashService;
    private readonly _jwtService;
    constructor(_inviteRepo: IInviteRepo, _userRepo: IUserRepo, _logger: ILogger, _hashService: IHashService, _jwtService: IJwtService);
    /**
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