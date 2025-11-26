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
exports.CompleteSignupUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const asyncHandler_1 = require("../../utils/asyncHandler");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
let CompleteSignupUseCase = class CompleteSignupUseCase {
    constructor(userRepo, logger, hashService, jwtService) {
        this._userRepo = userRepo;
        this._logger = logger;
        this._hashService = hashService;
        this._jwtService = jwtService;
    }
    async validateSignupData(data) {
        const { email, password, firstName, lastName } = data;
        if (!email || typeof email !== "string") {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Email is required");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid email format");
        }
        if (!firstName ||
            typeof firstName !== "string" ||
            firstName.trim().length < 2) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "First name must be at least 2 characters long");
        }
        if (firstName.trim().length > 100) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "First name must be less than 100 characters long");
        }
        if (!lastName ||
            typeof lastName !== "string" ||
            lastName.trim().length < 2) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Last name must be at least 2 characters long");
        }
        if (lastName.trim().length > 100) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Last name must be less than 100 characters long");
        }
        // Validate password strength using existing helper
        this._validatePassword(password);
        return true;
    }
    /**
     * Complete user signup process
     * @param email - User email
     * @param name - User full name
     * @param password - User password
     * @returns Updated user data
     */
    async execute(email, password, firstName, lastName, additionalData = {}) {
        this._logger.info("Completing user signup", { email, firstName, lastName });
        try {
            await this.validateSignupData({ email, password, firstName, lastName });
            const user = await this._userRepo.findByEmail(email);
            if (!user) {
                this._logger.warn("User not found for signup completion", { email });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.NOT_FOUND, "User not found");
            }
            if (!user.emailVerified) {
                this._logger.warn("Email not verified for signup completion", {
                    email,
                });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Email must be verified before completing signup");
            }
            if (user.name && user.password) {
                this._logger.warn("Signup already completed", { email });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.CONFLICT, "Signup has already been completed");
            }
            const hashedPassword = await this._hashService.hash(password);
            const fullName = `${firstName.trim()} ${lastName.trim()}`;
            const updatedUser = await this._userRepo.updateProfile(user.id, {
                name: fullName,
                password: hashedPassword,
                status: "ACTIVE",
                ...additionalData,
            });
            this._logger.info("Signup completed successfully", {
                userId: user.id,
                email,
                firstName,
                lastName,
            });
            const safeUserData = { ...updatedUser };
            Reflect.deleteProperty(safeUserData, "password");
            Reflect.deleteProperty(safeUserData, "resetPasswordToken");
            Reflect.deleteProperty(safeUserData, "resetPasswordExpires");
            Reflect.deleteProperty(safeUserData, "otp");
            Reflect.deleteProperty(safeUserData, "otpExpiry");
            const accessToken = this._jwtService.generateAccessToken({
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                orgId: updatedUser.orgId,
            });
            const refreshToken = this._jwtService.generateRefreshToken({
                id: updatedUser.id,
                email: updatedUser.email,
            });
            return {
                user: safeUserData,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 3600,
                },
            };
        }
        catch (error) {
            this._logger.error("Failed to complete signup", error, {
                email,
                firstName,
                lastName,
            });
            throw error;
        }
    }
    _validatePassword(password) {
        if (!password || typeof password !== "string") {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Password is required");
        }
        if (password.length < 8) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Password must be at least 8 characters long");
        }
        if (password.length > 128) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Password must be less than 128 characters long");
        }
        if (!/[a-z]/.test(password)) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Password must contain at least one lowercase letter");
        }
        if (!/[A-Z]/.test(password)) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Password must contain at least one uppercase letter");
        }
        if (!/\d/.test(password)) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Password must contain at least one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Password must contain at least one special character");
        }
        const weakPasswords = [
            "password",
            "12345678",
            "qwerty",
            "abc123",
            "password1",
            "admin123",
            "welcome1",
        ];
        if (weakPasswords.includes(password.toLowerCase())) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Password is too common. Please choose a stronger password");
        }
    }
};
exports.CompleteSignupUseCase = CompleteSignupUseCase;
exports.CompleteSignupUseCase = CompleteSignupUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IJwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CompleteSignupUseCase);
//# sourceMappingURL=CompleteSignupUseCase.js.map