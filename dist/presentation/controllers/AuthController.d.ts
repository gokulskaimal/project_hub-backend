import { Request, Response } from 'express';
import { IAuthUseCases } from '../../domain/interfaces/useCases/IAuthUseCases ';
import { IRegisterManagerUseCase } from '../../domain/interfaces/useCases/IRegisterManagerUseCase ';
import { ISendOtpUseCase } from '../../domain/interfaces/useCases/ISendOtpUseCase ';
import { IVerifyOtpUseCase } from '../../domain/interfaces/useCases/IVerifyOtpUseCase ';
import { ICompleteSignupUseCase } from '../../domain/interfaces/useCases/ICompleteSignupUseCase ';
import { IAcceptUseCase } from '../../domain/interfaces/useCases/IAcceptUseCase';
import { IInviteMemberUseCase } from '../../domain/interfaces/useCases/IInviteMemberUseCase ';
import { ILogger } from '../../domain/interfaces/services/ILogger';
/**
 * Authentication Controller
 *
 * Handles all authentication-related HTTP requests including login, registration,
 * token refresh, OTP verification, and invitation management.
 * Implements the presentation layer of the application architecture.
 */
export declare class AuthController {
    private authUseCases;
    private registerManagerUseCase;
    private sendOtpUseCase;
    private verifyOtpUseCase;
    private completeSignupUseCase;
    private acceptUseCase;
    private inviteMemberUseCase;
    private logger;
    /**
     * Creates a new AuthController instance with dependency injection
     *
     * @param authUseCases - Core authentication use cases
     * @param registerManagerUseCase - Manager registration use case
     * @param sendOtpUseCase - OTP sending use case
     * @param verifyOtpUseCase - OTP verification use case
     * @param completeSignupUseCase - Signup completion use case
     * @param acceptUseCase - Invitation acceptance use case
     * @param inviteMemberUseCase - Member invitation use case
     * @param logger - Logging service
     */
    constructor(authUseCases: IAuthUseCases, registerManagerUseCase: IRegisterManagerUseCase, sendOtpUseCase: ISendOtpUseCase, verifyOtpUseCase: IVerifyOtpUseCase, completeSignupUseCase: ICompleteSignupUseCase, acceptUseCase: IAcceptUseCase, inviteMemberUseCase: IInviteMemberUseCase, logger: ILogger);
    /**
     * Authenticates a user with email and password
     * Sets a refresh token cookie and returns user data with access token
     *
     * @param req - Express request object containing email and password
     * @param res - Express response object
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * Refreshes an authentication token using a refresh token
     * Accepts refresh token from cookies or request body
     *
     * @param req - Express request object containing refresh token
     * @param res - Express response object
     */
    refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * Registers a new organization manager
     * Initial step in the organization creation process
     *
     * @param req - Express request object containing registration data
     * @param res - Express response object
     */
    /**
     * Registers a new organization manager
     * Initial step in the organization creation process
     *
     * @param req - Express request object containing email and organization name
     * @param res - Express response object
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * Registers a new organization manager (alias for register method)
     * Provided for API compatibility
     *
     * @param req - Express request object containing registration data
     * @param res - Express response object
     */
    registerManager(req: Request, res: Response): Promise<void>;
    /**
     * Initiates a password reset request
     *
     * @param req - Express request object containing email
     * @param res - Express response object
     */
    requestPasswordReset(req: Request, res: Response): Promise<void>;
    /**
     * Initiates a password reset request (alias for requestPasswordReset method)
     * Provided for API compatibility
     *
     * @param req - Express request object containing email
     * @param res - Express response object
     */
    resetPasswordReq(req: Request, res: Response): Promise<void>;
    /**
     * Completes the password reset process
     *
     * @param req - Express request object containing token and new password
     * @param res - Express response object
     */
    completeReset(req: Request, res: Response): Promise<void>;
    /**
     * Completes the password reset process (alias for completeReset method)
     * Provided for API compatibility
     *
     * @param req - Express request object containing token and new password
     * @param res - Express response object
     */
    resetPassword(req: Request, res: Response): Promise<void>;
    /**
     * Verifies a user's email address using a verification token
     *
     * @param req - Express request object containing verification token
     * @param res - Express response object
     */
    verifyEmail(req: Request, res: Response): Promise<void>;
    sendOtp(req: Request, res: Response): Promise<void>;
    verifyOtp(req: Request, res: Response): Promise<void>;
    /**
     * Completes the signup process after OTP verification
     *
     * @param req - Express request object containing user details
     * @param res - Express response object
     */
    completeSignup(req: Request, res: Response): Promise<void>;
    /**
     * Accepts an invitation to join an organization
     *
     * @param req - Express request object containing token and user details
     * @param res - Express response object
     */
    acceptInvite(req: Request, res: Response): Promise<void>;
    /**
     * Invites a new member to join an organization
     *
     * @param req - Express request object containing email, organization ID and role
     * @param res - Express response object
     */
    inviteMember(req: Request, res: Response): Promise<void>;
    /**
     * Validates an invitation token
     *
     * @param req - Express request object containing token
     * @param res - Express response object
     */
    validateInviteToken(req: Request, res: Response): Promise<void>;
    /**
     * Logs out a user by invalidating their refresh token
     *
     * @param req - Express request object containing user ID and refresh token
     * @param res - Express response object
     */
    logout(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map