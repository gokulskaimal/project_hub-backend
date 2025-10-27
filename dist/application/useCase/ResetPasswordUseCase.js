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
exports.ResetPasswordUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
let ResetPasswordUseCase = class ResetPasswordUseCase {
    constructor(userRepo, hashService, jwtService, emailService, logger) {
        this._userRepo = userRepo;
        this._hashService = hashService;
        this._jwtService = jwtService;
        this._emailService = emailService;
        this._logger = logger;
    }
    /**
     * ✅ ADDED: Request password reset (send email with reset link)
     */
    async requestReset(email) {
        this._logger.info('Processing password reset request', { email });
        try {
            // Business Rule: Find user by email
            const user = await this._userRepo.findByEmail(email);
            if (!user) {
                // Don't reveal if email exists - security best practice
                return { message: 'If the email exists, a reset link has been sent' };
            }
            // Business Rule: Generate reset token
            const resetToken = this._jwtService.generateResetToken({
                id: user.id,
                email: user.email,
                type: 'password_reset'
            });
            // Business Rule: Set token expiry (1 hour)
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            // Store reset token in database
            await this._userRepo.setResetPasswordToken(email, resetToken, expiresAt);
            // ✅ FIXED: Use sendResetPasswordEmail instead of sendPasswordResetEmail
            await this._emailService.sendResetPasswordEmail(email, resetToken);
            this._logger.info('Password reset email sent', { email, userId: user.id });
            return {
                message: 'Password reset email sent successfully',
                token: resetToken // Only in development - remove in production
            };
        }
        catch (error) {
            this._logger.error('Password reset request failed', error, { email });
            throw new Error('Failed to process password reset request');
        }
    }
    /**
     * ✅ ADDED: Reset password using token
     */
    async resetWithToken(token, newPassword) {
        this._logger.info('Processing password reset with token');
        try {
            // Business Rule: Verify reset token
            const payload = this._jwtService.verifyResetToken(token);
            if (!payload) {
                throw new Error('Invalid or expired reset token');
            }
            // Business Rule: Find user by reset token
            const user = await this._userRepo.findByResetToken(token);
            if (!user) {
                throw new Error('Invalid or expired reset token');
            }
            // Business Rule: Validate new password
            this._validatePassword(newPassword);
            // Business Rule: Hash new password
            const hashedPassword = await this._hashService.hash(newPassword);
            // Update password and clear reset token
            await this._userRepo.updatePassword(user.id, hashedPassword);
            this._logger.info('Password reset successful', { userId: user.id });
            return { message: 'Password reset successfully' };
        }
        catch (error) {
            this._logger.error('Password reset with token failed', error);
            throw error;
        }
    }
    /**
     * ✅ ADDED: Complete password reset process
     */
    async completeReset(token, password) {
        // This is an alias to resetWithToken for backward compatibility
        return this.resetWithToken(token, password);
    }
    /**
     * ✅ ADDED: Validate reset token
     */
    async validateResetToken(token) {
        try {
            // Verify token signature and expiry
            const payload = this._jwtService.verifyResetToken(token);
            if (!payload) {
                return false;
            }
            // Check if token exists in database
            const user = await this._userRepo.findByResetToken(token);
            return !!user;
        }
        catch (error) {
            this._logger.error('Reset token validation failed', error);
            return false;
        }
    }
    /**
     * Validate password strength
     * @param password - Password to validate
     */
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
exports.ResetPasswordUseCase = ResetPasswordUseCase;
exports.ResetPasswordUseCase = ResetPasswordUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IJwtService)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IEmailService)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ResetPasswordUseCase);
//# sourceMappingURL=ResetPasswordUseCase.js.map