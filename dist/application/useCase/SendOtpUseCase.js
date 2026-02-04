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
exports.SendOtpUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const CommonErrors_1 = require("../../domain/errors/CommonErrors");
let SendOtpUseCase = class SendOtpUseCase {
    constructor(_userRepo, _otpService, _emailService, _logger, _cache) {
        this._userRepo = _userRepo;
        this._otpService = _otpService;
        this._emailService = _emailService;
        this._logger = _logger;
        this._cache = _cache;
    }
    /**
     * Send OTP
     */
    async execute(email) {
        this._logger.info("Sending OTP", { email });
        try {
            // Business Rule: Validate email format
            if (!this._isValidEmail(email)) {
                throw new CommonErrors_1.ValidationError("Invalid email format");
            }
            // Business Rule: Check rate limiting
            const attemptsRemaining = await this._checkRateLimit(email);
            if (attemptsRemaining <= 0) {
                throw new CommonErrors_1.TooManyRequestsError("Too many OTP requests. Please wait before requesting again.");
            }
            const otp = this._otpService.generateOtp(6); // 6-digit OTP
            const expiresAt = this._otpService.generateExpiry(1); // 1 minute from now
            await this._userRepo.ensureUserWithOtp(email, otp, expiresAt);
            // Send OTP via email
            await this._emailService.sendOtpEmail(email, otp, "Email verification");
            this._logger.info("OTP sent successfully", { email, expiresAt });
            return {
                message: "OTP sent successfully to your email",
                expiresAt,
                attemptsRemaining: attemptsRemaining - 1,
            };
        }
        catch (error) {
            this._logger.error("Failed to send OTP", error, { email });
            throw error;
        }
    }
    /**
     * Resend OTP if previous one expired
     */
    async resendOtp(email) {
        this._logger.info("Resending OTP", { email });
        try {
            // Business Rule: Check if previous OTP is still valid
            const existingOtp = await this._userRepo.getOtp(email);
            if (existingOtp && existingOtp.expiresAt > new Date()) {
                const remainingTime = Math.ceil((existingOtp.expiresAt.getTime() - Date.now()) / 1000 / 60);
                throw new CommonErrors_1.InvalidOperationError(`OTP is still valid. Please wait ${remainingTime} minutes before requesting a new one.`);
            }
            // Use the same logic as execute
            return this.execute(email);
        }
        catch (error) {
            this._logger.error("Failed to resend OTP", error, { email });
            throw error;
        }
    }
    /**
     * Check rate limiting for OTP requests
     * @param email - User email
     * @returns Number of attempts remaining
     */
    async _checkRateLimit(email) {
        try {
            const MAX_ATTEMPTS_PER_HOUR = 5;
            const key = `otp:reqs:${email}`;
            const ttlSeconds = 60 * 60;
            const current = await this._cache.incr(key);
            if (current === 1) {
                await this._cache.expire(key, ttlSeconds);
            }
            const attemptsRemaining = Math.max(0, MAX_ATTEMPTS_PER_HOUR - current);
            return attemptsRemaining;
        }
        catch (error) {
            this._logger.error("Rate limit check failed", error, { email });
            return 0;
        }
    }
    /**
     * Validate email format
     * @param email - Email to validate
     * @returns Whether email is valid
     */
    _isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};
exports.SendOtpUseCase = SendOtpUseCase;
exports.SendOtpUseCase = SendOtpUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IOtpService)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IEmailService)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.ICacheService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], SendOtpUseCase);
//# sourceMappingURL=SendOtpUseCase.js.map