/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserProfileUseCase } from "../../domain/interfaces/useCases/IUserProfileUseCase";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { ILogger } from "../../domain/interfaces/services/ILogger";

@injectable()
export class UserProfileUseCase implements IUserProfileUseCase {
  private readonly _userRepo: IUserRepo;
  private readonly _hashService: IHashService;
  private readonly _logger: ILogger;

  constructor(
    @inject(TYPES.IUserRepo) userRepo: IUserRepo,
    @inject(TYPES.IHashService) hashService: IHashService,
    @inject(TYPES.ILogger) logger: ILogger,
  ) {
    this._userRepo = userRepo;
    this._hashService = hashService;
    this._logger = logger;
  }

  public async getProfile(userId: string): Promise<any> {
    this._logger.info("Getting user profile", { userId });

    try {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const {
        password,
        resetPasswordToken,
        resetPasswordExpires,
        otp,
        otpExpiry,
        ...safeUserData
      } = user;
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
    updateData: Record<string, any>,
  ): Promise<any> {
    this._logger.info("Updating user profile", {
      userId,
      fields: Object.keys(updateData),
    });

    try {
      const existingUser = await this._userRepo.findById(userId);
      if (!existingUser) {
        throw new Error("User not found");
      }

      const allowedFields = ["firstName", "lastName", "name"];

      const filteredUpdateData = Object.keys(updateData)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj: Record<string, any>, key) => {
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

      const {
        password,
        resetPasswordToken,
        resetPasswordExpires,
        otp,
        otpExpiry,
        ...safeUserData
      } = updatedUser;
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
        throw new Error("User not found");
      }

      const isCurrentPasswordValid = await this._hashService.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      this._validatePassword(newPassword);

      const isSamePassword = await this._hashService.compare(
        newPassword,
        user.password,
      );
      if (isSamePassword) {
        throw new Error("New password must be different from current password");
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
        throw new Error("User not found");
      }

      const isPasswordValid = await this._hashService.compare(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new Error("Invalid password");
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
  ): Promise<any[]> {
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
      throw new Error("Password is required");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error("Password must contain at least one special character");
    }
  }
}
