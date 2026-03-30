import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserProfileUseCase } from "../interface/useCases/IUserProfileUseCase";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { IHashService } from "../../application/interface/services/IHashService";
import { ILogger } from "../../application/interface/services/ILogger";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import {
  UserDTO,
  toUserDTO,
  UpdateProfileRequestDTO,
} from "../../application/dto/UserDTO";
import { User } from "../../domain/entities/User";
import {
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";
import { InvalidCredentialsError } from "../../domain/errors/AuthErrors";
import { ISecurityService } from "../../application/interface/services/ISecurityService";

@injectable()
export class UserProfileUseCase implements IUserProfileUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IAuthValidationService)
    private readonly _authValidationService: IAuthValidationService,
    @inject(TYPES.ISecurityService)
    private readonly _securityService: ISecurityService,
  ) {}

  public async getProfile(
    userId: string,
    requesterId?: string,
  ): Promise<UserDTO> {
    if (requesterId) {
      await this._securityService.validateUserOwnership(requesterId, userId);
    }
    this._logger.info("Getting user profile", { userId });

    // Handle synthetic Super Admin ID (from env-based login)
    if (userId === "super_admin") {
      const now = new Date().toISOString();
      return {
        id: "super_admin",
        email: process.env.SUPER_ADMIN_EMAIL || "admin@projecthub.com",
        name: "Super Admin",
        firstName: "Super",
        lastName: "Admin",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        emailVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
        profileComplete: true,
        orgId: null,
        avatar: null,
      };
    }

    try {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new EntityNotFoundError("User", userId);
      }

      let organizationName: string | undefined;

      if (user.orgId) {
        try {
          const org = await this._orgRepo.findById(user.orgId);
          if (org) {
            organizationName = org.name;
          }
        } catch (error) {
          this._logger.warn("Failed to fetch organization details", {
            userId,
            orgId: user.orgId,
            error,
          });
        }
      }

      // Combine user and organizationName for the DTO mapper
      return toUserDTO({ ...user, organizationName });
    } catch (error) {
      this._logger.error("Failed to get user profile", error as Error, {
        userId,
      });
      throw error;
    }
  }

  public async updateProfile(
    userId: string,
    updateData: UpdateProfileRequestDTO,
    requesterId?: string,
  ): Promise<UserDTO> {
    if (requesterId) {
      await this._securityService.validateUserOwnership(requesterId, userId);
    }
    this._logger.info("Updating user profile", {
      userId,
      fields: Object.keys(updateData),
    });

    try {
      const existingUser = await this._userRepo.findById(userId);
      if (!existingUser) {
        throw new EntityNotFoundError("User", userId);
      }

      const filteredUpdateData: Partial<User> = {};

      if (updateData.firstName)
        filteredUpdateData.firstName = updateData.firstName;
      if (updateData.lastName)
        filteredUpdateData.lastName = updateData.lastName;
      if (updateData.avatar !== undefined)
        filteredUpdateData.avatar = updateData.avatar;

      if (filteredUpdateData.firstName || filteredUpdateData.lastName) {
        const firstName =
          (filteredUpdateData.firstName as string) || existingUser.firstName;
        const lastName =
          (filteredUpdateData.lastName as string) || existingUser.lastName;
        filteredUpdateData.name = `${firstName} ${lastName}`.trim();
      }

      const updatedUser = await this._userRepo.update(
        userId,
        filteredUpdateData,
      );

      if (!updatedUser) {
        throw new EntityNotFoundError("User not found after update");
      }

      return toUserDTO({ ...updatedUser });
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
    requesterId?: string,
  ): Promise<void> {
    if (requesterId) {
      await this._securityService.validateUserOwnership(requesterId, userId);
    }
    this._logger.info("Changing user password", { userId });

    try {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new EntityNotFoundError("User", userId);
      }

      const isCurrentPasswordValid = await this._hashService.compare(
        currentPassword,
        user.password,
      );
      if (!isCurrentPasswordValid) {
        throw new InvalidCredentialsError();
      }
      this._authValidationService.validatePassword(newPassword);

      const isSamePassword = await this._hashService.compare(
        newPassword,
        user.password,
      );
      if (isSamePassword) {
        throw new ValidationError(
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

  public async deleteAccount(
    userId: string,
    password: string,
    requesterId: string,
  ): Promise<void> {
    await this._securityService.validateUserOwnership(requesterId, userId);
    this._logger.info("Deleting user account", { userId, requesterId });

    try {
      const user = await this._userRepo.findById(userId);
      if (!user) {
        throw new EntityNotFoundError("User", userId);
      }

      const isPasswordValid = await this._hashService.compare(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }

      await this._userRepo.update(userId, {
        status: "INACTIVE",
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
    requesterId: string,
  ): Promise<Record<string, unknown>[]> {
    await this._securityService.validateUserOwnership(requesterId, userId);
    this._logger.info("Getting user activity history", {
      userId,
      requesterId,
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
}
