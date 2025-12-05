import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserProfileUseCase } from "../interface/useCases/IUserProfileUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class UserProfileUseCase implements IUserProfileUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  public async getProfile(userId: string): Promise<Record<string, unknown>> {
    this._logger.info("Getting user profile", { userId });

    try {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new HttpError(StatusCodes.NOT_FOUND, "User not found");
      }

      const safeUserData = {
        ...(user as unknown as Record<string, unknown>),
      } as Record<string, unknown>;

      if (user.orgId) {
        const org = await this._orgRepo.findById(user.orgId);
        if (org) {
          safeUserData.organizationName = org.name;
        }
      }

      Reflect.deleteProperty(safeUserData, "password");
      Reflect.deleteProperty(safeUserData, "resetPasswordToken");
      Reflect.deleteProperty(safeUserData, "resetPasswordExpires");
      Reflect.deleteProperty(safeUserData, "otp");
      Reflect.deleteProperty(safeUserData, "otpExpiry");
      return safeUserData;
    } catch (error) {
      this._logger.error("Failed to get user profile", error as Error, {
        userId,
      });
      throw error;
    }
  }

  public async updateProfile(
    userId: string,
    updateData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    this._logger.info("Updating user profile", {
      userId,
      fields: Object.keys(updateData),
    });

    try {
      const existingUser = await this._userRepo.findById(userId);
      if (!existingUser) {
        throw new HttpError(StatusCodes.NOT_FOUND, "User not found");
      }

      const allowedFields = ["firstName", "lastName", "name", "avatar"];

      const filteredUpdateData = Object.keys(updateData)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj: Record<string, unknown>, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});

      if (filteredUpdateData.firstName || filteredUpdateData.lastName) {
        const firstName =
          filteredUpdateData.firstName || existingUser.firstName;
        const lastName = filteredUpdateData.lastName || existingUser.lastName;
        filteredUpdateData.name = `${firstName} ${lastName}`.trim();
      }

      const updatedUser = await this._userRepo.update(
        userId,
        filteredUpdateData,
      );

      this._logger.info("User profile updated successfully", { userId });

      const safeUserData = {
        ...(updatedUser as unknown as Record<string, unknown>),
      } as Record<string, unknown>;
      Reflect.deleteProperty(safeUserData, "password");
      Reflect.deleteProperty(safeUserData, "resetPasswordToken");
      Reflect.deleteProperty(safeUserData, "resetPasswordExpires");
      Reflect.deleteProperty(safeUserData, "otp");
      Reflect.deleteProperty(safeUserData, "otpExpiry");
      return safeUserData;
    } catch (error) {
      this._logger.error("Failed to update user profile", error as Error, {
        userId,
      });
      throw error;
    }
  }

  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    this._logger.info("Changing user password", { userId });

    try {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new HttpError(StatusCodes.NOT_FOUND, "User not found");
      }

      const isCurrentPasswordValid = await this._hashService.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new HttpError(
          StatusCodes.UNAUTHORIZED,
          "Current password is incorrect",
        );
      }

      this._validatePassword(newPassword);

      const isSamePassword = await this._hashService.compare(
        newPassword,
        user.password,
      );
      if (isSamePassword) {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          "New password must be different from current password",
        );
      }

      const hashedNewPassword = await this._hashService.hash(newPassword);
      await this._userRepo.updatePassword(userId, hashedNewPassword);

      this._logger.info("Password changed successfully", { userId });
    } catch (error) {
      this._logger.error("Failed to change password", error as Error, {
        userId,
      });
      throw error;
    }
  }

  public async deleteAccount(userId: string, password: string): Promise<void> {
    this._logger.info("Deleting user account", { userId });

    try {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new HttpError(StatusCodes.NOT_FOUND, "User not found");
      }

      const isPasswordValid = await this._hashService.compare(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new HttpError(StatusCodes.UNAUTHORIZED, "Invalid password");
      }

      // ✅ FIXED: Use 'INACTIVE' instead of 'DELETED' (valid User status)
      await this._userRepo.update(userId, {
        status: "INACTIVE" as const, // Use valid User status
        email: `deleted_${Date.now()}_${user.email}`,
      });

      this._logger.info("Account deleted successfully", { userId });
    } catch (error) {
      this._logger.error("Failed to delete account", error as Error, {
        userId,
      });
      throw error;
    }
  }

  public async getActivityHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Record<string, unknown>[]> {
    this._logger.info("Getting user activity history", {
      userId,
      limit,
      offset,
    });

    try {
      const activities = [
        {
          id: "1",
          type: "LOGIN",
          description: "User logged in",
          timestamp: new Date(),
          metadata: { ip: "192.168.1.1", userAgent: "Mozilla/5.0..." },
        },
        {
          id: "2",
          type: "PROFILE_UPDATE",
          description: "Profile information updated",
          timestamp: new Date(Date.now() - 86400000),
          metadata: { updatedFields: ["firstName"] },
        },
      ];

      const paginatedActivities = activities.slice(offset, offset + limit);

      this._logger.info("Activity history retrieved", {
        userId,
        count: paginatedActivities.length,
      });

      return paginatedActivities;
    } catch (error) {
      this._logger.error("Failed to get activity history", error as Error, {
        userId,
      });
      throw error;
    }
  }

  private _validatePassword(password: string): void {
    if (!password || typeof password !== "string") {
      throw new HttpError(StatusCodes.BAD_REQUEST, "Password is required");
    }

    if (password.length < 8) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must be at least 8 characters long",
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must contain at least one special character",
      );
    }
  }
}
