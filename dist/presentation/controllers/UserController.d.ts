import { Response } from "express";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IUserProfileUseCase } from "../../domain/interfaces/useCases/IUserProfileUseCase";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
/**
 * User Controller
 *
 * Handles all user-related HTTP requests including profile management
 * Implements the presentation layer of the application architecture
 */
export declare class UserController {
    private readonly _logger;
    private readonly _userProfileUseCase;
    /**
     * Creates a new UserController instance with dependency injection
     *
     * @param logger - Logging service
     * @param userProfileUseCase - User profile management use case
     */
    constructor(logger: ILogger, userProfileUseCase: IUserProfileUseCase);
    /**
     * Retrieves the profile information for the authenticated user
     *
     * @param req - Express request object with authenticated user
     * @param res - Express response object
     */
    getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Updates the profile information for the authenticated user
     *
     * @param req - Express request object with authenticated user and update data
     * @param res - Express response object
     */
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Changes the password for the authenticated user
     *
     * @param req - Express request object with authenticated user and password data
     * @param res - Express response object
     */
    changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Gets the activity history for the authenticated user
     *
     * @param req - Express request object with authenticated user
     * @param res - Express response object
     */
    /**
     * Deletes (soft delete) the authenticated user's account
     *
     * @param req - Express request object with authenticated user and confirmation data
     * @param res - Express response object
     */
    deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map