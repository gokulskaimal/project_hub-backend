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
exports.AuthUseCases = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
let AuthUseCases = class AuthUseCases {
    constructor(userRepo, hashService, jwtService, resetPasswordUseCase, logger) {
        this._userRepo = userRepo;
        this._hashService = hashService;
        this._jwtService = jwtService;
        this._resetPasswordUseCase = resetPasswordUseCase;
        this._logger = logger;
    }
    async login(email, password) {
        this._logger.info('User login attempt', { email });
        try {
            const user = await this._userRepo.findByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }
            if (!user.emailVerified) {
                throw new Error('Email not verified');
            }
            const isPasswordValid = await this._hashService.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            const payload = {
                id: user.id,
                email: user.email,
                role: user.role,
                orgId: user.orgId
            };
            const accessToken = this._jwtService.generateAccessToken(payload);
            const refreshToken = this._jwtService.generateRefreshToken(payload);
            await this._userRepo.updateLastLogin(user.id, new Date());
            this._logger.info('User login successful', { userId: user.id, email });
            const { password: _, otp, otpExpiry, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
            return {
                user: safeUser,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 3600 // 1 hour
                }
            };
        }
        catch (error) {
            this._logger.error('User login failed', error, { email });
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this._jwtService.verifyRefreshToken(refreshToken);
            if (!payload) {
                throw new Error('Invalid refresh token');
            }
            const user = await this._userRepo.findById(payload.id);
            if (!user) {
                throw new Error('User not found');
            }
            const newPayload = {
                id: user.id,
                email: user.email,
                role: user.role,
                orgId: user.orgId
            };
            const accessToken = this._jwtService.generateAccessToken(newPayload);
            return {
                accessToken,
                expiresIn: 3600
            };
        }
        catch (error) {
            this._logger.error('Token refresh failed', error);
            throw new Error('Invalid refresh token');
        }
    }
    async logout(userId, refreshToken) {
        try {
            // In a real implementation, you would blacklist the tokens
            this._logger.info('User logged out', { userId });
        }
        catch (error) {
            this._logger.error('Logout failed', error, { userId });
            throw error;
        }
    }
    async validateToken(token) {
        try {
            const payload = this._jwtService.verifyAccessToken(token);
            if (!payload) {
                throw new Error('Invalid token');
            }
            const user = await this._userRepo.findById(payload.id);
            if (!user) {
                throw new Error('User not found');
            }
            const { password: _, otp, otpExpiry, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
            return safeUser;
        }
        catch (error) {
            this._logger.error('Token validation failed', error);
            throw error;
        }
    }
    /**
     * ✅ ADDED: Request password reset - REQUIRED BY AuthController
     */
    async resetPasswordReq(email) {
        return this._resetPasswordUseCase.requestReset(email);
    }
    /**
     * ✅ ADDED: Reset password with token - REQUIRED BY AuthController
     */
    async resetPassword(token, newPassword) {
        return this._resetPasswordUseCase.resetWithToken(token, newPassword);
    }
    /**
     * ✅ ADDED: Verify email - REQUIRED BY AuthController
     */
    async verifyEmail(token) {
        try {
            const payload = this._jwtService.verifyAccessToken(token);
            if (!payload) {
                throw new Error('Invalid verification token');
            }
            const user = await this._userRepo.findById(payload.id);
            if (!user) {
                throw new Error('User not found');
            }
            if (user.emailVerified) {
                return {
                    message: 'Email already verified',
                    verified: true
                };
            }
            await this._userRepo.verifyEmail(user.id);
            this._logger.info('Email verified successfully', { userId: user.id });
            return {
                message: 'Email verified successfully',
                verified: true
            };
        }
        catch (error) {
            this._logger.error('Email verification failed', error);
            throw new Error('Invalid or expired verification token');
        }
    }
};
exports.AuthUseCases = AuthUseCases;
exports.AuthUseCases = AuthUseCases = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IJwtService)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IResetPasswordUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AuthUseCases);
//# sourceMappingURL=AuthUseCase.js.map