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
let VerifyOtpUseCase = class VerifyOtpUseCase {
    constructor(userRepo, logger) {
        this._userRepo = userRepo;
        this._logger = logger;
    }
    async execute(email, otp) {
        this._logger.info('Verifying OTP', { email });
        try {
            if (!email || !otp) {
                return {
                    valid: false,
                    message: 'Email and OTP are required',
                    verified: false
                };
            }
            const user = await this._userRepo.verifyOtp(email, otp);
            if (!user) {
                const attemptsRemaining = await this.getAttemptsRemaining(email);
                this._logger.warn('OTP verification failed', {
                    email,
                    attemptsRemaining
                });
                return {
                    valid: false,
                    message: attemptsRemaining > 0
                        ? `Invalid OTP. ${attemptsRemaining} attempts remaining.`
                        : 'Invalid OTP. Too many attempts. Please request a new OTP.',
                    verified: false
                };
            }
            await this._userRepo.verifyEmail(user.id);
            await this._userRepo.saveOtp(email, '', new Date());
            this._logger.info('OTP verified successfully', {
                email,
                userId: user.id
            });
            return {
                valid: true,
                message: 'OTP verified successfully',
                verified: true
            };
        }
        catch (error) {
            this._logger.error('OTP verification failed', error, { email });
            return {
                valid: false,
                message: 'OTP verification failed. Please try again.',
                verified: false
            };
        }
    }
    /**
     * ✅ ADDED: Check OTP attempts remaining - REQUIRED BY INTERFACE
     */
    async getAttemptsRemaining(email) {
        this._logger.info('Checking OTP attempts remaining', { email });
        try {
            const MAX_ATTEMPTS = 3;
            const user = await this._userRepo.findByEmail(email);
            if (!user) {
                return 0;
            }
            if (!user.otp || !user.otpExpiry) {
                return 0;
            }
            if (user.otpExpiry < new Date()) {
                return 0;
            }
            return MAX_ATTEMPTS;
        }
        catch (error) {
            this._logger.error('Failed to get attempts remaining', error, { email });
            return 0;
        }
    }
};
exports.VerifyOtpUseCase = VerifyOtpUseCase;
exports.VerifyOtpUseCase = VerifyOtpUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object, Object])
], VerifyOtpUseCase);
//# sourceMappingURL=VerifyOtpUseCase.js.map