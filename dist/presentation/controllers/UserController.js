"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
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
exports.UserController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const UserDTO_1 = require("../../application/dto/UserDTO");
const common_constants_1 = require("../../infrastructure/config/common.constants");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
/**
 * User Controller
 *
 * Handles all user-related HTTP requests including profile management
 * Implements the presentation layer of the application architecture
 */
let UserController = class UserController {
    /**
     * Creates a new UserController instance with dependency injection
     *
     * @param logger - Logging service
     * @param userProfileUseCase - User profile management use case
     */
    constructor(logger, userProfileUseCase) {
        this._logger = logger;
        this._userProfileUseCase = userProfileUseCase;
    }
    /**
     * Retrieves the profile information for the authenticated user
     *
     * @param req - Express request object with authenticated user
     * @param res - Express response object
     */
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            this._logger.info("User getting profile", {
                userId,
                ip: req.ip,
            });
            const profile = await this._userProfileUseCase.getProfile(userId);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.PROFILE_RETRIEVED,
                data: (0, UserDTO_1.toUserDTO)(profile),
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to retrieve profile";
            this._logger.error("Failed to get user profile", err, {
                userId: req.user?.id,
                ip: req.ip,
            });
            // Determine appropriate status code based on error
            const statusCode = err instanceof Error && err.message.includes("not found")
                ? statusCodes_enum_1.StatusCodes.NOT_FOUND
                : statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Updates the profile information for the authenticated user
     *
     * @param req - Express request object with authenticated user and update data
     * @param res - Express response object
     */
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;
            // Basic validation
            if (!updateData || Object.keys(updateData).length === 0) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: common_constants_1.COMMON_MESSAGES.REQUIRED_FIELD,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("User updating profile", {
                userId,
                updateFields: Object.keys(updateData),
                ip: req.ip,
            });
            const updatedProfile = await this._userProfileUseCase.updateProfile(userId, updateData);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.PROFILE_UPDATED,
                data: (0, UserDTO_1.toUserDTO)(updatedProfile),
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update profile";
            this._logger.error("Failed to update user profile", err, {
                userId: req.user?.id,
                updateData: req.body,
                ip: req.ip,
            });
            let statusCode = statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR;
            if (err instanceof Error) {
                if (err.message.includes("not found")) {
                    statusCode = statusCodes_enum_1.StatusCodes.NOT_FOUND;
                }
                else if (err.message.includes("validation") ||
                    err.message.includes("invalid")) {
                    statusCode = statusCodes_enum_1.StatusCodes.BAD_REQUEST;
                }
                else if (err.message.includes("unauthorized") ||
                    err.message.includes("permission")) {
                    statusCode = statusCodes_enum_1.StatusCodes.FORBIDDEN;
                }
            }
            res.status(statusCode).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Changes the password for the authenticated user
     *
     * @param req - Express request object with authenticated user and password data
     * @param res - Express response object
     */
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            // Input validation
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: common_constants_1.COMMON_MESSAGES.REQUIRED_FIELD,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            if (newPassword !== confirmNewPassword) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: common_constants_1.COMMON_MESSAGES.INVALID_INPUT,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("User changing password", {
                userId,
                ip: req.ip,
            });
            await this._userProfileUseCase.changePassword(userId, currentPassword, newPassword);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.PASSWORD_CHANGED,
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to change password";
            this._logger.error("Failed to change password", err, {
                userId: req.user?.id,
                ip: req.ip,
            });
            // Determine appropriate status code based on error
            let statusCode = statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR;
            if (err instanceof Error) {
                if (err.message.includes("current password") ||
                    err.message.includes("incorrect")) {
                    statusCode = statusCodes_enum_1.StatusCodes.BAD_REQUEST;
                }
                else if (err.message.includes("not found")) {
                    statusCode = statusCodes_enum_1.StatusCodes.NOT_FOUND;
                }
                else if (err.message.includes("weak") ||
                    err.message.includes("validation")) {
                    statusCode = statusCodes_enum_1.StatusCodes.BAD_REQUEST;
                }
            }
            res.status(statusCode).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Gets the activity history for the authenticated user
     *
     * @param req - Express request object with authenticated user
     * @param res - Express response object
     */
    // public async getActivityHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    //     try {
    //         const userId = req.user!.id
    //         const { limit = 10, offset = 0 } = req.query
    //         this._logger.info('User getting activity history', {
    //             userId,
    //             limit: Number(limit),
    //             offset: Number(offset),
    //             ip: req.ip
    //         })
    //         const activities = await this._userProfileUseCase.getActivityHistory(
    //             userId,
    //             Number(limit),
    //             Number(offset)
    //         )
    //         res.status(HttpStatus.OK).json({
    //             success: true,
    //             message: 'Activity history retrieved successfully',
    //             data: activities,
    //             count: activities.length,
    //             pagination: {
    //                 limit: Number(limit),
    //                 offset: Number(offset)
    //             },
    //             timestamp: new Date().toISOString()
    //         })
    //     } catch (err: unknown) {
    //         const message = (err instanceof Error) ? err.message : 'Failed to retrieve activity history'
    //         this._logger.error('Failed to get activity history', err as Error, {
    //             userId: req.user?.id,
    //             ip: req.ip
    //         })
    //         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    //             success: false,
    //             error: message,
    //             timestamp: new Date().toISOString()
    //         })
    //     }
    // }
    /**
     * Deletes (soft delete) the authenticated user's account
     *
     * @param req - Express request object with authenticated user and confirmation data
     * @param res - Express response object
     */
    async deleteAccount(req, res) {
        try {
            const userId = req.user.id;
            const { password, confirmation } = req.body;
            // Input validation
            if (!password || confirmation !== "DELETE") {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: common_constants_1.COMMON_MESSAGES.REQUIRED_FIELD,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("User deleting account", {
                userId,
                ip: req.ip,
            });
            await this._userProfileUseCase.deleteAccount(userId, password);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.USER_DELETED,
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : common_constants_1.COMMON_MESSAGES.GENERAL_ERROR;
            this._logger.error("Failed to delete account", err, {
                userId: req.user?.id,
                ip: req.ip,
            });
            // Determine appropriate status code based on error
            let statusCode = statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR;
            if (err instanceof Error) {
                if (err.message.includes("password") ||
                    err.message.includes("incorrect")) {
                    statusCode = statusCodes_enum_1.StatusCodes.BAD_REQUEST;
                }
                else if (err.message.includes("not found")) {
                    statusCode = statusCodes_enum_1.StatusCodes.NOT_FOUND;
                }
            }
            res.status(statusCode).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IUserProfileUseCase)),
    __metadata("design:paramtypes", [Object, Object])
], UserController);
//# sourceMappingURL=UserController.js.map