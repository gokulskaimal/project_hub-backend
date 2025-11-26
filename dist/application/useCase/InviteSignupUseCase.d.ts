import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { IInviteSignupUseCase } from "../../domain/interfaces/useCases/IInviteSignupUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { UserRole } from "../../domain/enums/UserRole";
import { AuthTokens } from "../../domain/interfaces/useCases/types";
import { User } from "../../domain/entities/User";
import { Organization } from "../../domain/entities/Organization";
/**
 * Invite Signup Use Case - Application Layer
 * Handles signup through invitation flow
 */
export declare class InviteSignupUseCase implements IInviteSignupUseCase {
    private readonly _userRepo;
    private readonly _orgRepo;
    private readonly _logger;
    private readonly _hashService;
    constructor(userRepo: IUserRepo, orgRepo: IOrgRepo, logger: ILogger, hashService: IHashService);
    execute(_inviteToken: string, _userData: {
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        user: User;
        organization: Organization;
        tokens: AuthTokens;
    }>;
    getInvitationDetails(_token: string): Promise<{
        email: string;
        organizationName: string;
        invitedBy: string;
        expiresAt: Date;
        role?: string;
    }>;
    /**
     * Sign up user through invitation
     * @param email - User email
     * @param password - User password
     * @param orgId - Organization identifier
     * @param role - User role
     * @returns Created user data
     */
    signup(email: string, password: string, orgId: string, role: UserRole): Promise<Partial<User>>;
    /**
     * Sign up user with pre-verified email (through invitation token)
     * @param email - User email
     * @param password - User password
     * @param name - User full name
     * @param orgId - Organization identifier
     * @param role - User role
     * @returns Created user data
     */
    signupWithVerifiedEmail(email: string, password: string, name: string, orgId: string, role: UserRole): Promise<Partial<User>>;
    /**
     * Validate input parameters
     * @param email - Email to validate
     * @param password - Password to validate
     * @param orgId - Organization ID to validate
     * @param role - Role to validate
     */
    private _validateInput;
    /**
     * Validate input parameters with name
     * @param email - Email to validate
     * @param password - Password to validate
     * @param name - Name to validate
     * @param orgId - Organization ID to validate
     * @param role - Role to validate
     */
    private _validateInputWithName;
    /**
     * Validate password strength
     * @param password - Password to validate
     */
    private _validatePassword;
    /**
     * Validate role permissions for organization
     * @param role - Role to validate
     * @param organization - Organization context
     */
    private _validateRolePermissions;
}
//# sourceMappingURL=InviteSignupUseCase.d.ts.map