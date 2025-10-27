"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const messages_1 = require("../../domain/constants/messages");
const HttpStatus_1 = require("../../domain/enums/HttpStatus");
/**
 * Authentication Controller
 *
 * Handles all authentication-related HTTP requests including login, registration,
 * token refresh, OTP verification, and invitation management.
 * Implements the presentation layer of the application architecture.
 */
let AuthController = class AuthController {
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
    constructor(authUseCases, registerManagerUseCase, sendOtpUseCase, verifyOtpUseCase, completeSignupUseCase, acceptUseCase, inviteMemberUseCase, logger) {
        this.authUseCases = authUseCases;
        this.registerManagerUseCase = registerManagerUseCase;
        this.sendOtpUseCase = sendOtpUseCase;
        this.verifyOtpUseCase = verifyOtpUseCase;
        this.completeSignupUseCase = completeSignupUseCase;
        this.acceptUseCase = acceptUseCase;
        this.inviteMemberUseCase = inviteMemberUseCase;
        this.logger = logger;
    }
    /**
     * Authenticates a user with email and password
     * Sets a refresh token cookie and returns user data with access token
     *
     * @param req - Express request object containing email and password
     * @param res - Express response object
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            const result = await this.authUseCases.login(email, password);
            // ✅ FIXED: Correctly access nested properties
            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.LOGIN_SUCCESS,
                data: {
                    user: result.user,
                    role: result.user.role, // ✅ FIXED: Access role from user object
                    accessToken: result.tokens.accessToken, // ✅ FIXED: Access from tokens object
                    expiresIn: result.tokens.expiresIn
                }
            });
        }
        catch (error) {
            this.logger.error('Login failed', error);
            res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: error.message || messages_1.MESSAGES.AUTH.INVALID_CREDENTIALS
            });
        }
    }
    /**
     * Refreshes an authentication token using a refresh token
     * Accepts refresh token from cookies or request body
     *
     * @param req - Express request object containing refresh token
     * @param res - Express response object
     */
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: messages_1.MESSAGES.AUTH.TOKEN_INVALID
                });
                return;
            }
            const result = await this.authUseCases.refreshToken(refreshToken);
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.TOKEN_REFRESHED,
                data: result
            });
        }
        catch (error) {
            this.logger.error('Token refresh failed', error);
            res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: messages_1.MESSAGES.AUTH.TOKEN_INVALID
            });
        }
    }
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
    async register(req, res) {
        try {
            const { email, organizationName } = req.body;
            if (!email || !organizationName) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            const result = await this.registerManagerUseCase.execute(email, organizationName);
            res.status(HttpStatus_1.HttpStatus.CREATED).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.REGISTRATION_SUCCESS,
                data: result
            });
        }
        catch (error) {
            this.logger.error('Manager registration failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message || messages_1.MESSAGES.AUTH.OTP_INVALID
            });
        }
    }
    /**
     * Registers a new organization manager (alias for register method)
     * Provided for API compatibility
     *
     * @param req - Express request object containing registration data
     * @param res - Express response object
     */
    async registerManager(req, res) {
        return this.register(req, res);
    }
    /**
     * Initiates a password reset request
     *
     * @param req - Express request object containing email
     * @param res - Express response object
     */
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            // ✅ FIXED: Use correct method name
            const result = await this.authUseCases.resetPasswordReq(email);
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.PASSWORD_RESET_SENT,
                data: result
            });
        }
        catch (error) {
            this.logger.error('Password reset request failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message || messages_1.MESSAGES.GENERAL.ERROR
            });
        }
    }
    /**
     * Initiates a password reset request (alias for requestPasswordReset method)
     * Provided for API compatibility
     *
     * @param req - Express request object containing email
     * @param res - Express response object
     */
    async resetPasswordReq(req, res) {
        return this.requestPasswordReset(req, res);
    }
    /**
     * Completes the password reset process
     *
     * @param req - Express request object containing token and new password
     * @param res - Express response object
     */
    async completeReset(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            await this.authUseCases.resetPassword(token, password);
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.PASSWORD_RESET_SUCCESS
            });
        }
        catch (error) {
            this.logger.error('Password reset completion failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message || messages_1.MESSAGES.INVITE.INVALID
            });
        }
    }
    /**
     * Completes the password reset process (alias for completeReset method)
     * Provided for API compatibility
     *
     * @param req - Express request object containing token and new password
     * @param res - Express response object
     */
    async resetPassword(req, res) {
        return this.completeReset(req, res);
    }
    /**
     * Verifies a user's email address using a verification token
     *
     * @param req - Express request object containing verification token
     * @param res - Express response object
     */
    async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            const result = await this.authUseCases.verifyEmail(token);
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.EMAIL_VERIFIED,
                data: { verified: result.verified }
            });
        }
        catch (error) {
            this.logger.error('Email verification failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message || messages_1.MESSAGES.GENERAL.ERROR
            });
        }
    }
    async sendOtp(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
                return;
            }
            const result = await this.sendOtpUseCase.execute(email);
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.OTP_SENT,
                data: {
                    expiresAt: result.expiresAt,
                    attemptsRemaining: result.attemptsRemaining
                }
            });
        }
        catch (error) {
            this.logger.error('Send OTP failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }
    }
    async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res.status(400).json({
                    success: false,
                    message: 'Email and OTP are required'
                });
                return;
            }
            const result = await this.verifyOtpUseCase.execute(email, otp);
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.OTP_VERIFIED,
                data: {
                    valid: result.valid,
                    verified: result.verified
                }
            });
        }
        catch (error) {
            this.logger.error('OTP verification failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }
    }
    /**
     * Completes the signup process after OTP verification
     *
     * @param req - Express request object containing user details
     * @param res - Express response object
     */
    async completeSignup(req, res) {
        try {
            const { email, password, firstName, lastName, additionalData } = req.body;
            if (!email || !password || !firstName || !lastName) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            // ✅ FIXED: Provide all required parameters (5 total)
            const result = await this.completeSignupUseCase.execute(email, password, firstName, lastName, additionalData || {});
            res.status(HttpStatus_1.HttpStatus.CREATED).json({
                success: true,
                message: messages_1.MESSAGES.USER.CREATED,
                data: result
            });
        }
        catch (error) {
            this.logger.error('Complete signup failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }
    }
    /**
     * Accepts an invitation to join an organization
     *
     * @param req - Express request object containing token and user details
     * @param res - Express response object
     */
    async acceptInvite(req, res) {
        try {
            const { token, password, firstName, lastName } = req.body;
            if (!token || !password || !firstName || !lastName) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            // ✅ FIXED: Provide all required parameters (4 total)
            const result = await this.acceptUseCase.execute(token, password, firstName, lastName);
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.INVITE.ACCEPTED,
                data: result
            });
        }
        catch (error) {
            this.logger.error('Accept invitation failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }
    }
    /**
     * Invites a new member to join an organization
     *
     * @param req - Express request object containing email, organization ID and role
     * @param res - Express response object
     */
    async inviteMember(req, res) {
        try {
            const { email, orgId, role } = req.body;
            if (!email || !orgId) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            const result = await this.inviteMemberUseCase.execute(email, orgId, role);
            res.status(HttpStatus_1.HttpStatus.CREATED).json({
                success: true,
                message: messages_1.MESSAGES.INVITE.SENT,
                data: result
            });
        }
        catch (error) {
            this.logger.error('Invite member failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message
            });
        }
    }
    /**
     * Validates an invitation token
     *
     * @param req - Express request object containing token
     * @param res - Express response object
     */
    async validateInviteToken(req, res) {
        try {
            const { token } = req.params;
            if (!token) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: messages_1.MESSAGES.VALIDATION.REQUIRED_FIELD
                });
                return;
            }
            // In a real implementation, you would validate the invitation token
            // For now, we'll return a mock response
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.INVITE.INVALID,
                data: {
                    valid: true,
                    organizationName: 'Sample Organization',
                    inviterEmail: 'manager@example.com'
                }
            });
        }
        catch (error) {
            this.logger.error('Token validation failed', error);
            res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: messages_1.MESSAGES.INVITE.INVALID
            });
        }
    }
    /**
     * Logs out a user by invalidating their refresh token
     *
     * @param req - Express request object containing user ID and refresh token
     * @param res - Express response object
     */
    async logout(req, res) {
        try {
            const userId = req.user?.id;
            const refreshToken = req.cookies.refreshToken;
            if (userId && refreshToken) {
                await this.authUseCases.logout(userId, refreshToken);
            }
            res.clearCookie('refreshToken');
            res.status(HttpStatus_1.HttpStatus.OK).json({
                success: true,
                message: messages_1.MESSAGES.AUTH.LOGOUT_SUCCESS
            });
        }
        catch (error) {
            this.logger.error('Logout failed', error);
            res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: messages_1.MESSAGES.GENERAL.SERVER_ERROR
            });
        }
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IAuthUseCases)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IRegisterManagerUseCase)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ISendOtpUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IVerifyOtpUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.ICompleteSignupUseCase)),
    __param(5, (0, inversify_1.inject)(types_1.TYPES.IAcceptUseCase)),
    __param(6, (0, inversify_1.inject)(types_1.TYPES.IInviteMemberUseCase)),
    __param(7, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], AuthController);
//# sourceMappingURL=AuthController.js.map