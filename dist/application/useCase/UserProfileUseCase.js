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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
let UserProfileUseCase = class UserProfileUseCase {
    constructor(userRepo, hashService, logger) {
        this._userRepo = userRepo;
        this._hashService = hashService;
        this._logger = logger;
    }
    async getProfile(userId) {
        this._logger.info('Getting user profile', { userId });
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const { password, resetPasswordToken, resetPasswordExpires, otp, otpExpiry, ...safeUserData } = user;
            return safeUserData;
        }
        catch (error) {
            this._logger.error('Failed to get user profile', error, { userId });
            throw error;
        }
    }
    async updateProfile(userId, updateData) {
        this._logger.info('Updating user profile', { userId, fields: Object.keys(updateData) });
        try {
            const existingUser = await this._userRepo.findById(userId);
            if (!existingUser) {
                throw new Error('User not found');
            }
            const allowedFields = [
                'firstName', 'lastName', 'name', 'phone', 'avatar',
                'timezone', 'language', 'title', 'department', 'bio',
                'dateOfBirth', 'preferences'
            ];
            const filteredUpdateData = Object.keys(updateData)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});
            if (filteredUpdateData.firstName || filteredUpdateData.lastName) {
                const firstName = filteredUpdateData.firstName || existingUser.firstName;
                const lastName = filteredUpdateData.lastName || existingUser.lastName;
                filteredUpdateData.name = `${firstName} ${lastName}`.trim();
            }
            const updatedUser = await this._userRepo.update(userId, filteredUpdateData);
            this._logger.info('User profile updated successfully', { userId });
            const { password, resetPasswordToken, resetPasswordExpires, otp, otpExpiry, ...safeUserData } = updatedUser;
            return safeUserData;
        }
        catch (error) {
            this._logger.error('Failed to update user profile', error, { userId });
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        this._logger.info('Changing user password', { userId });
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const isCurrentPasswordValid = await this._hashService.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            this._validatePassword(newPassword);
            const isSamePassword = await this._hashService.compare(newPassword, user.password);
            if (isSamePassword) {
                throw new Error('New password must be different from current password');
            }
            const hashedNewPassword = await this._hashService.hash(newPassword);
            await this._userRepo.updatePassword(userId, hashedNewPassword);
            this._logger.info('Password changed successfully', { userId });
        }
        catch (error) {
            this._logger.error('Failed to change password', error, { userId });
            throw error;
        }
    }
    async deleteAccount(userId, password) {
        this._logger.info('Deleting user account', { userId });
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const isPasswordValid = await this._hashService.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }
            // ✅ FIXED: Use 'INACTIVE' instead of 'DELETED' (valid User status)
            await this._userRepo.update(userId, {
                status: 'INACTIVE', // Use valid User status
                deletedAt: new Date(),
                email: `deleted_${Date.now()}_${user.email}`
            });
            this._logger.info('Account deleted successfully', { userId });
        }
        catch (error) {
            this._logger.error('Failed to delete account', error, { userId });
            throw error;
        }
    }
    async getActivityHistory(userId, limit = 50, offset = 0) {
        this._logger.info('Getting user activity history', { userId, limit, offset });
        try {
            const activities = [
                {
                    id: '1',
                    type: 'LOGIN',
                    description: 'User logged in',
                    timestamp: new Date(),
                    metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
                },
                {
                    id: '2',
                    type: 'PROFILE_UPDATE',
                    description: 'Profile information updated',
                    timestamp: new Date(Date.now() - 86400000),
                    metadata: { updatedFields: ['firstName', 'phone'] }
                }
            ];
            const paginatedActivities = activities.slice(offset, offset + limit);
            this._logger.info('Activity history retrieved', { userId, count: paginatedActivities.length });
            return paginatedActivities;
        }
        catch (error) {
            this._logger.error('Failed to get activity history', error, { userId });
            throw error;
        }
    }
    async uploadAvatar(userId, fileBuffer, fileName) {
        this._logger.info('Uploading user avatar', { userId, fileName, fileSize: fileBuffer.length });
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
            const fileExtension = fileName.split('.').pop()?.toLowerCase();
            if (!fileExtension || !allowedTypes.includes(fileExtension)) {
                throw new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.');
            }
            if (fileBuffer.length > 5 * 1024 * 1024) {
                throw new Error('File size too large. Maximum size is 5MB.');
            }
            const avatarUrl = `/uploads/avatars/${userId}_${Date.now()}.${fileExtension}`;
            await this._userRepo.update(userId, { avatar: avatarUrl });
            this._logger.info('Avatar uploaded successfully', { userId, avatarUrl });
            return avatarUrl;
        }
        catch (error) {
            this._logger.error('Failed to upload avatar', error, { userId, fileName });
            throw error;
        }
    }
    async updatePreferences(userId, preferences) {
        this._logger.info('Updating user preferences', { userId, preferences: Object.keys(preferences) });
        try {
            const user = await this._userRepo.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const existingPreferences = user.preferences || {};
            const updatedPreferences = { ...existingPreferences, ...preferences };
            const updatedUser = await this._userRepo.update(userId, {
                preferences: updatedPreferences
            });
            this._logger.info('User preferences updated successfully', { userId });
            return updatedUser.preferences;
        }
        catch (error) {
            this._logger.error('Failed to update preferences', error, { userId });
            throw error;
        }
    }
    _validatePassword(password) {
        if (!password || typeof password !== 'string') {
            throw new Error('Password is required');
        }
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new Error('Password must contain at least one lowercase letter, one uppercase letter, and one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new Error('Password must contain at least one special character');
        }
    }
};
exports.UserProfileUseCase = UserProfileUseCase;
exports.UserProfileUseCase = UserProfileUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object, Object, Object])
], UserProfileUseCase);
//# sourceMappingURL=UserProfileUseCase.js.map