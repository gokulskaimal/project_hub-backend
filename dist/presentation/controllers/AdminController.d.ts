import { Request, Response } from 'express';
import { IUserRepo } from '../../domain/interfaces/IUserRepo';
import { IOrgRepo } from '../../domain/interfaces/IOrgRepo';
import { IInviteMemberUseCase } from '../../domain/interfaces/useCases/IInviteMemberUseCase ';
import { ILogger } from '../../domain/interfaces/services/ILogger';
/**
 * Admin Controller
 *
 * Handles administrative operations for managing organizations and users
 * Implements the presentation layer of the application architecture
 */
export declare class AdminController {
    private userRepo;
    private orgRepo;
    private inviteMemberUseCase;
    private logger;
    /**
     * Creates a new AdminController instance with dependency injection
     *
     * @param userRepo - User repository for user management
     * @param orgRepo - Organization repository for organization management
     * @param inviteMemberUseCase - Use case for inviting members
     * @param logger - Logging service
     */
    constructor(userRepo: IUserRepo, orgRepo: IOrgRepo, inviteMemberUseCase: IInviteMemberUseCase, logger: ILogger);
    /**
     * Lists all organizations with pagination and search capabilities
     *
     * @param req - Express request object with query parameters
     * @param res - Express response object
     */
    listOrganizations(req: Request, res: Response): Promise<void>;
    /**
     * Creates a new organization
     *
     * @param req - Express request object with organization data
     * @param res - Express response object
     */
    createOrganization(req: Request, res: Response): Promise<void>;
    /**
     * Retrieves an organization by its ID
     *
     * @param req - Express request object with organization ID parameter
     * @param res - Express response object
     */
    getOrganizationById(req: Request, res: Response): Promise<void>;
    /**
     * Updates an existing organization
     *
     * @param req - Express request object with organization ID and update data
     * @param res - Express response object
     */
    updateOrganization(req: Request, res: Response): Promise<void>;
    /**
     * Deletes an organization by its ID
     *
     * @param req - Express request object with organization ID parameter
     * @param res - Express response object
     */
    deleteOrganization(req: Request, res: Response): Promise<void>;
    /**
     * Lists all users with pagination, search, and filtering capabilities
     *
     * @param req - Express request object with query parameters
     * @param res - Express response object
     */
    listUsers(req: Request, res: Response): Promise<void>;
    /**
     * Retrieves a user by their ID
     *
     * @param req - Express request object with user ID parameter
     * @param res - Express response object
     */
    getUserById(req: Request, res: Response): Promise<void>;
    /**
     * Updates a user's information
     *
     * @param req - Express request object with user ID and update data
     * @param res - Express response object
     */
    updateUser(req: Request, res: Response): Promise<void>;
    /**
     * Updates a user's status
     *
     * @param req - Express request object with user ID and status data
     * @param res - Express response object
     */
    updateUserStatus(req: Request, res: Response): Promise<void>;
    /**
     * Deletes a user from the system
     *
     * @param req - Express request object with user ID parameter
     * @param res - Express response object
     */
    deleteUser(req: Request, res: Response): Promise<void>;
    /**
     * Generates system reports with user and organization statistics
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    getReports(req: Request, res: Response): Promise<void>;
    /**
     * Retrieves statistics for the admin dashboard
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    getDashboardStats(req: Request, res: Response): Promise<void>;
    /**
     * Retrieves all users belonging to a specific organization
     *
     * @param req - Express request object with organization ID parameter
     * @param res - Express response object
     */
    getUsersByOrganization(req: Request, res: Response): Promise<void>;
    /**
     * Invites a new member to an organization
     *
     * @param req - Express request object with email, organization ID, and role
     * @param res - Express response object
     */
    inviteMember(req: Request, res: Response): Promise<void>;
    /**
     * Invites multiple members to an organization in bulk
     *
     * @param req - Express request object with emails array, organization ID, and role
     * @param res - Express response object
     */
    bulkInviteMembers(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AdminController.d.ts.map