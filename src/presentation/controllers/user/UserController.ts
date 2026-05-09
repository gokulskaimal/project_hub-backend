import { Response } from "express";
import { injectable, inject } from "inversify";
import { ILogger } from "../../../application/interface/services/ILogger";
import { TYPES } from "../../../infrastructure/container/types";
import { IUserProfileUseCase } from "../../../application/interface/useCases/IUserProfileUseCase";
import { IGetUserVelocityUseCase } from "../../../application/interface/useCases/IGetUserVelocityUseCase";
import { IGetMemberAnalyticsUseCase } from "../../../application/interface/useCases/IGetMemberAnalyticsUseCase";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { TimeFrame } from "../../../utils/DateUtils";

import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  UserUpdateProfileSchema,
  ChangePasswordSchema,
  DeleteAccountSchema,
} from "../../../application/dto/ValidationSchemas";
import { z } from "zod";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IUserProfileUseCase)
    private _userProfileUseCase: IUserProfileUseCase,
    @inject(TYPES.IGetUserVelocityUseCase)
    private _getUserVelocityUC: IGetUserVelocityUseCase,
    @inject(TYPES.IGetMemberAnalyticsUseCase)
    private _getMemberAnalyticsUC: IGetMemberAnalyticsUseCase,
  ) {}

  getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      this._logger.info("Fetching user profile", { userId });
      const profile = await this._userProfileUseCase.getProfile(userId, userId);
      ResponseHandler.success(res, profile, COMMON_MESSAGES.PROFILE_RETRIEVED);
    },
  );

  updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;

      const validation = UserUpdateProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return ResponseHandler.validationError(res, validation.error.format());
      }
      const updateData = validation.data;

      this._logger.info("Updating user profile", {
        userId,
        updatedFields: Object.keys(updateData || {}),
      });

      if (Object.keys(updateData).length === 0) {
        return ResponseHandler.validationError(
          res,
          COMMON_MESSAGES.REQUIRED_FIELD,
        );
      }

      const updatedProfile = await this._userProfileUseCase.updateProfile(
        userId,
        updateData,
        userId,
      );
      ResponseHandler.success(
        res,
        updatedProfile,
        COMMON_MESSAGES.PROFILE_UPDATED,
      );
    },
  );

  changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      this._logger.info("Change password attempt", { userId });

      const validation = ChangePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return ResponseHandler.validationError(res, validation.error.format());
      }

      const { currentPassword, newPassword } = validation.data;

      await this._userProfileUseCase.changePassword(
        userId,
        currentPassword,
        newPassword,
        userId,
      );
      ResponseHandler.success(res, null, COMMON_MESSAGES.PASSWORD_CHANGED);
    },
  );

  deleteAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      this._logger.info("Delete account attempt", { userId });

      const validation = DeleteAccountSchema.safeParse(req.body);
      if (!validation.success) {
        return ResponseHandler.validationError(res, validation.error.format());
      }

      const { password } = validation.data;
      await this._userProfileUseCase.deleteAccount(userId, password, userId);
      ResponseHandler.success(res, null, COMMON_MESSAGES.USER_DELETED);
    },
  );

  getVelocity = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      const schema = z.object({
        days: z.coerce.number().int().min(1).max(365).optional(),
      });
      const parsed = schema.safeParse(req.query);
      if (!parsed.success) {
        return ResponseHandler.validationError(res, parsed.error.format());
      }

      const days = parsed.data.days ?? 7;
      const result = await this._getUserVelocityUC.execute(
        userId,
        days,
        userId,
      );

      ResponseHandler.success(
        res,
        {
          totalPoints: result.totalPoints,
          days: result.days,
          start: result.start.toISOString(),
          end: result.end.toISOString(),
        },
        "Velocity retrieved",
      );
    },
  );

  getAnalytics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user!.id;
      const { filter } = req.query;
      this._logger.info("Fetching member analytics", { userId, filter });
      const analytics = await this._getMemberAnalyticsUC.execute(
        userId,
        filter as TimeFrame,
      );
      ResponseHandler.success(res, analytics, "Analytics retrieved");
    },
  );
}
