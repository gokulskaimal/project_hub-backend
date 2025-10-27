import { Response } from 'express';
import { ILogger } from '../../domain/interfaces/services/ILogger';
import { IUserRepo } from '../../domain/interfaces/IUserRepo';
import { IInviteRepo } from '../../domain/interfaces/IInviteRepo';
import { IInviteMemberUseCase } from '../../domain/interfaces/useCases/IInviteMemberUseCase ';
import { AuthenticatedRequest } from '../middleware/types/AuthenticatedRequest';
/**
 * Manager Controller
 *
 * Handles operations specific to organization managers including member management
 * and invitation handling within their organization
 */
export declare class ManagerController {
    private readonly _logger;
    private readonly _userRepo;
    private readonly _inviteRepo;
    private readonly _inviteMemberUC;
    /**
     * Creates a new ManagerController instance with dependency injection
     *
     * @param logger - Logging service
     * @param userRepo - User repository for member management
     * @param inviteRepo - Invitation repository for invitation management
     * @param inviteMemberUC - Use case for inviting members
     */
    constructor(logger: ILogger, userRepo: IUserRepo, inviteRepo: IInviteRepo, inviteMemberUC: IInviteMemberUseCase);
    /**
     * Invites a new member to the manager's organization
     *
     * @param req - Authenticated request object with email in body
     * @param res - Express response object
     */
    inviteMember(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Invites multiple members to the manager's organization in bulk
     *
     * @param req - Authenticated request object with emails array in body
     * @param res - Express response object
     */
    bulkInvite(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Lists all invitations for the manager's organization
     *
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    listInvitations(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Cancels a pending invitation
     *
     * @param req - Authenticated request object with invitation token parameter
     * @param res - Express response object
     */
    cancelInvitation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * List organization members - Manager only
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    listMembers(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get member by ID - Manager only
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    getMemberById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Update member status - Manager only
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    updateMemberStatus(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Remove member from organization - Manager only
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    removeMember(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ManagerController.d.ts.map