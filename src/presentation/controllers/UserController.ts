/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { TYPES } from "../../infrastructure/container/types";
import { IUserProfileUseCase } from "../../domain/interfaces/useCases/IUserProfileUseCase";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { toUserDTO } from "../../application/dto/UserDTO";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

/**
 * User Controller
 *
 * Handles all user-related HTTP requests including profile management
 * Implements the presentation layer of the application architecture
 */
@injectable()
export class UserController {
  private readonly _logger: ILogger;
  private readonly _userProfileUseCase: IUserProfileUseCase;

  /**
   * Creates a new UserController instance with dependency injection
   *
   * @param logger - Logging service
   * @param userProfileUseCase - User profile management use case
   */
  constructor(
    @inject(TYPES.ILogger) logger: ILogger,
    @inject(TYPES.IUserProfileUseCase) userProfileUseCase: IUserProfileUseCase,
  ) {
    this._logger = logger;
    this._userProfileUseCase = userProfileUseCase;
  }

  /**
   * Retrieves the profile information for the authenticated user
   *
   * @param req - Express request object with authenticated user
   * @param res - Express response object
   */
  public async getProfile(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user!.id;

      this._logger.info("User getting profile", {
        userId,
        ip: req.ip,
      });

      const profile = await this._userProfileUseCase.getProfile(userId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.PROFILE_RETRIEVED,
        data: toUserDTO(profile),
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to retrieve profile";

      this._logger.error("Failed to get user profile", err as Error, {
        userId: req.user?.id,
        ip: req.ip,
      });

      // Determine appropriate status code based on error
      const statusCode =
        err instanceof Error && err.message.includes("not found")
          ? StatusCodes.NOT_FOUND
          : StatusCodes.INTERNAL_SERVER_ERROR;

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
  public async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      // Basic validation
      if (!updateData || Object.keys(updateData).length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: COMMON_MESSAGES.REQUIRED_FIELD,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      this._logger.info("User updating profile", {
        userId,
        updateFields: Object.keys(updateData),
        ip: req.ip,
      });

      const updatedProfile = await this._userProfileUseCase.updateProfile(
        userId,
        updateData,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.PROFILE_UPDATED,
        data: toUserDTO(updatedProfile),
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";

      this._logger.error("Failed to update user profile", err as Error, {
        userId: req.user?.id,
        updateData: req.body,
        ip: req.ip,
      });

      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      if (err instanceof Error) {
        if (err.message.includes("not found")) {
          statusCode = StatusCodes.NOT_FOUND;
        } else if (
          err.message.includes("validation") ||
          err.message.includes("invalid")
        ) {
          statusCode = StatusCodes.BAD_REQUEST;
        } else if (
          err.message.includes("unauthorized") ||
          err.message.includes("permission")
        ) {
          statusCode = StatusCodes.FORBIDDEN;
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
  public async changePassword(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword, confirmNewPassword } = req.body;

      // Input validation
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: COMMON_MESSAGES.REQUIRED_FIELD,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      if (newPassword !== confirmNewPassword) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: COMMON_MESSAGES.INVALID_INPUT,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      this._logger.info("User changing password", {
        userId,
        ip: req.ip,
      });

      await this._userProfileUseCase.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.PASSWORD_CHANGED,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to change password";

      this._logger.error("Failed to change password", err as Error, {
        userId: req.user?.id,
        ip: req.ip,
      });

      // Determine appropriate status code based on error
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      if (err instanceof Error) {
        if (
          err.message.includes("current password") ||
          err.message.includes("incorrect")
        ) {
          statusCode = StatusCodes.BAD_REQUEST;
        } else if (err.message.includes("not found")) {
          statusCode = StatusCodes.NOT_FOUND;
        } else if (
          err.message.includes("weak") ||
          err.message.includes("validation")
        ) {
          statusCode = StatusCodes.BAD_REQUEST;
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
  public async deleteAccount(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { password, confirmation } = req.body;

      // Input validation
      if (!password || confirmation !== "DELETE") {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: COMMON_MESSAGES.REQUIRED_FIELD,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      this._logger.info("User deleting account", {
        userId,
        ip: req.ip,
      });

      await this._userProfileUseCase.deleteAccount(userId, password);

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.USER_DELETED,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : COMMON_MESSAGES.GENERAL_ERROR;

      this._logger.error("Failed to delete account", err as Error, {
        userId: req.user?.id,
        ip: req.ip,
      });

      // Determine appropriate status code based on error
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      if (err instanceof Error) {
        if (
          err.message.includes("password") ||
          err.message.includes("incorrect")
        ) {
          statusCode = StatusCodes.BAD_REQUEST;
        } else if (err.message.includes("not found")) {
          statusCode = StatusCodes.NOT_FOUND;
        }
      }

      res.status(statusCode).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
