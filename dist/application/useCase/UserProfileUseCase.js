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
exports.UserProfileUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const UserDTO_1 = require("../../application/dto/UserDTO");
const CommonErrors_1 = require("../../domain/errors/CommonErrors");
const AuthErrors_1 = require("../../domain/errors/AuthErrors");
let UserProfileUseCase = class UserProfileUseCase {
    constructor(_userRepo, _orgRepo, _hashService, _logger) {
        this._userRepo = _userRepo;
        this._orgRepo = _orgRepo;
        this._hashService = _hashService;
        this._logger = _logger;
    }
    async getProfile(userId) {
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
                throw new CommonErrors_1.EntityNotFoundError("User", userId);
            }
            let organizationName;
            if (user.orgId) {
                try {
                    const org = await this._orgRepo.findById(user.orgId);
                    if (org) {
                        organizationName = org.name;
                    }
                }
                catch (error) {
                    this._logger.warn("Failed to fetch organization details", {
                        userId,
                        orgId: user.orgId,
                        error,
                    });
                }
            }
            // Combine user and organizationName for the DTO mapper
            return (0, UserDTO_1.toUserDTO)({ ...user, organizationName });
        }
        catch (error) {
            this._logger.error("Failed to get user profile", error, {
                userId,
            });
            throw error;
        }
    }
    async updateProfile(userId, updateData) {
        this._logger.info("Updating user profile", {
            userId,
            fields: Object.keys(updateData),
        });
        try {
            const existingUser = await this._userRepo.findById(userId);
            if (!existingUser) {
                throw new CommonErrors_1.EntityNotFoundError("User", userId);
            }
            const filteredUpdateData = {};
            if (updateData.firstName)
                filteredUpdateData.firstName = updateData.firstName;
            if (updateData.lastName)
                filteredUpdateData.lastName = updateData.lastName;
            if (updateData.avatar !== undefined)
                filteredUpdateData.avatar = updateData.avatar;
            if (filteredUpdateData.firstName || filteredUpdateData.lastName) {
                const firstName = filteredUpdateData.firstName || existingUser.firstName;
                const lastName = filteredUpdateData.lastName || existingUser.lastName;
                filteredUpdateData.name = `${firstName} ${lastName}`.trim();
            }
            const updatedUser = await this._userRepo.update(userId, filteredUpdateData);
            if (!updatedUser) {
                throw new CommonErrors_1.EntityNotFoundError("User not found after update");
            }
            return (0, UserDTO_1.toUserDTO)({ ...updatedUser });
        }
        catch (error) {
            this._logger.error("Failed to update user profile", error, {
                userId,
            });
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        this._logger.info("Changing user password", { userId });
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                throw new CommonErrors_1.EntityNotFoundError("User", userId);
            }
            const isCurrentPasswordValid = await this._hashService.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new AuthErrors_1.InvalidCredentialsError();
            }
            this._validatePassword(newPassword);
            const isSamePassword = await this._hashService.compare(newPassword, user.password);
            if (isSamePassword) {
                throw new CommonErrors_1.ValidationError("New password must be different from current password");
            }
            const hashedNewPassword = await this._hashService.hash(newPassword);
            await this._userRepo.updatePassword(userId, hashedNewPassword);
            this._logger.info("Password changed successfully", { userId });
        }
        catch (error) {
            this._logger.error("Failed to change password", error, {
                userId,
            });
            throw error;
        }
    }
    async deleteAccount(userId, password) {
        this._logger.info("Deleting user account", { userId });
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                throw new CommonErrors_1.EntityNotFoundError("User", userId);
            }
            const isPasswordValid = await this._hashService.compare(password, user.password);
            if (!isPasswordValid) {
                throw new AuthErrors_1.InvalidCredentialsError();
            }
            await this._userRepo.update(userId, {
                status: "INACTIVE",
                email: `deleted_${Date.now()}_${user.email}`,
            });
            this._logger.info("Account deleted successfully", { userId });
        }
        catch (error) {
            this._logger.error("Failed to delete account", error, {
                userId,
            });
            throw error;
        }
    }
    async getActivityHistory(userId, limit = 50, offset = 0) {
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
        }
        catch (error) {
            this._logger.error("Failed to get activity history", error, {
                userId,
            });
            throw error;
        }
    }
    _validatePassword(password) {
        if (!password || typeof password !== "string") {
            throw new CommonErrors_1.ValidationError("Password is required");
        }
        if (password.length < 8) {
            throw new CommonErrors_1.ValidationError("Password must be at least 8 characters long");
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new CommonErrors_1.ValidationError("Password must contain at least one lowercase letter, one uppercase letter, and one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new CommonErrors_1.ValidationError("Password must contain at least one special character");
        }
    }
};
exports.UserProfileUseCase = UserProfileUseCase;
exports.UserProfileUseCase = UserProfileUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IOrgRepo)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UserProfileUseCase);
//# sourceMappingURL=UserProfileUseCase.js.map