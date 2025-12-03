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
exports.VerifyOtpUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const asyncHandler_1 = require("../../utils/asyncHandler");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
let VerifyOtpUseCase = class VerifyOtpUseCase {
    constructor(_userRepo, _logger, _cache) {
        this._userRepo = _userRepo;
        this._logger = _logger;
        this._cache = _cache;
    }
    async execute(email, otp) {
        this._logger.info("Verifying OTP", { email });
        try {
            if (!email || !otp) {
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Email and OTP are required");
            }
            const user = await this._userRepo.verifyOtp(email, otp);
            if (!user) {
                const attemptsRemaining = await this.getAttemptsRemaining(email);
                const key = `otp:verify:${email}`;
                await this._cache.incr(key);
                this._logger.warn("OTP verification failed", {
                    email,
                    attemptsRemaining,
                });
                const message = attemptsRemaining > 0
                    ? `Invalid OTP. ${attemptsRemaining} attempts remaining.`
                    : "Invalid OTP. Too many attempts. Please request a new OTP.";
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, message);
            }
            await this._userRepo.verifyEmail(user.id);
            await this._userRepo.saveOtp(email, "", new Date());
            await this._cache.del(`otp:verify:${email}`);
            this._logger.info("OTP verified successfully", {
                email,
                userId: user.id,
            });
            return {
                valid: true,
                message: "OTP verified successfully",
                verified: true,
            };
        }
        catch (error) {
            this._logger.error("OTP verification failed", error, { email });
            throw error;
        }
    }
    async getAttemptsRemaining(email) {
        this._logger.info("Checking OTP attempts remaining", { email });
        try {
            const MAX_ATTEMPTS = 3;
            const key = `otp:verify:${email}`;
            const used = Number(await this._cache.get(key)) || 0;
            const remaining = Math.max(0, MAX_ATTEMPTS - used);
            return remaining;
        }
        catch (error) {
            this._logger.error("Failed to get attempts remaining", error, {
                email,
            });
            return 0;
        }
    }
};
exports.VerifyOtpUseCase = VerifyOtpUseCase;
exports.VerifyOtpUseCase = VerifyOtpUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ICacheService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], VerifyOtpUseCase);
//# sourceMappingURL=VerifyOtpUseCase.js.map