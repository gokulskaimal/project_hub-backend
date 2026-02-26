import { Response } from "express";
import { injectable, inject } from "inversify";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { TYPES } from "../../../infrastructure/container/types";
import { IUserProfileUseCase } from "../../../application/interface/useCases/IUserProfileUseCase";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";

import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  UserUpdateProfileSchema,
  ChangePasswordSchema,
  DeleteAccountSchema,
} from "../../../application/dto/ValidationSchemas";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IUserProfileUseCase)
    private userProfileUseCase: IUserProfileUseCase,
  ) {}

  private sendSuccess(res: Response, data: unknown, message: string) {
    res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      this._logger.info("Fetching user profile", { userId });
      const profile = await this.userProfileUseCase.getProfile(userId);
      this.sendSuccess(res, profile, COMMON_MESSAGES.PROFILE_RETRIEVED);
    },
  );

  updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;

      const validation = UserUpdateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation Error",
          errors: validation.error.format(),
        });
        return;
      }
      const updateData = validation.data;

      this._logger.info("Updating user profile", {
        userId,
        updatedFields: Object.keys(updateData || {}),
      });

      if (Object.keys(updateData).length === 0) {
        throw {
          status: StatusCodes.BAD_REQUEST,
          message: COMMON_MESSAGES.REQUIRED_FIELD,
        };
      }

      const updatedProfile = await this.userProfileUseCase.updateProfile(
        userId,
        updateData,
      );
      this.sendSuccess(res, updatedProfile, COMMON_MESSAGES.PROFILE_UPDATED);
    },
  );

  changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      this._logger.info("Change password attempt", { userId });

      const validation = ChangePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation Error",
          errors: validation.error.format(),
        });
        return;
      }

      const { currentPassword, newPassword } = validation.data;

      await this.userProfileUseCase.changePassword(
        userId,
        currentPassword,
        newPassword,
      );
      this.sendSuccess(res, null, COMMON_MESSAGES.PASSWORD_CHANGED);
    },
  );

  deleteAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      this._logger.info("Delete account attempt", { userId });

      const validation = DeleteAccountSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation Error",
          errors: validation.error.format(),
        });
        return;
      }

      const { password } = validation.data;
      await this.userProfileUseCase.deleteAccount(userId, password);
      this.sendSuccess(res, null, COMMON_MESSAGES.USER_DELETED);
    },
  );
}
