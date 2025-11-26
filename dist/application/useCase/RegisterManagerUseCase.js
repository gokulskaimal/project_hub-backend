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
exports.RegisterManagerUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const UserRole_1 = require("../../domain/enums/UserRole");
const Organization_1 = require("../../domain/entities/Organization");
const asyncHandler_1 = require("../../utils/asyncHandler");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
let RegisterManagerUseCase = class RegisterManagerUseCase {
    constructor(userRepo, otpService, emailService, logger, orgRepo) {
        this._userRepo = userRepo;
        this._otpService = otpService;
        this._emailService = emailService;
        this._logger = logger;
        this._orgRepo = orgRepo;
    }
    async execute(email, organizationName) {
        this._logger.info("Manager registration attempt", {
            email,
            organizationName,
        });
        try {
            this._validateInput(email, organizationName);
            const isNameAvailable = await this.validateOrganizationName(organizationName);
            if (!isNameAvailable) {
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.CONFLICT, "Organization name is already taken");
            }
            const existingUser = await this._userRepo.findByEmail(email);
            if (existingUser && existingUser.emailVerified) {
                this._logger.warn("Manager already exists and verified", { email });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.CONFLICT, "User already exists and is verified");
            }
            // ✅ FIXED: Use const assertion for organization status
            const organizationData = {
                name: organizationName.trim(),
                status: Organization_1.OrganizationStatus.ACTIVE, // Use const assertion
                createdAt: new Date(),
                settings: {
                    allowInvitations: true,
                    requireEmailVerification: true,
                },
            };
            const organization = await this._orgRepo.create(organizationData);
            const invitationToken = this._generateInvitationToken();
            const otp = this._otpService.generateOtp(6);
            const expiry = this._otpService.generateExpiry(1);
            const userData = {
                email,
                orgId: organization.id,
                role: UserRole_1.UserRole.ORG_MANAGER,
                password: "",
                otp,
                otpExpiry: expiry,
                invitationToken,
                emailVerified: false,
                status: "PENDING_VERIFICATION",
                createdAt: new Date(),
            };
            if (existingUser) {
                await this._userRepo.updateProfile(existingUser.id, userData);
            }
            else {
                await this._userRepo.create(userData);
            }
            await this._emailService.sendOtpEmail(email, otp, `${organizationName} manager registration`);
            this._logger.info("Manager registration initiated successfully", {
                email,
                organizationName,
                organizationId: organization.id,
            });
            return {
                message: "Organization created and verification email sent",
                organizationId: organization.id,
                invitationToken,
                otpExpiresAt: expiry,
            };
        }
        catch (error) {
            this._logger.error("Manager registration failed", error, {
                email,
                organizationName,
            });
            throw error;
        }
    }
    async validateOrganizationName(name) {
        this._logger.info("Validating organization name availability", { name });
        try {
            if (!name || typeof name !== "string") {
                return false;
            }
            const trimmedName = name.trim();
            if (trimmedName.length < 2) {
                return false;
            }
            if (trimmedName.length > 100) {
                return false;
            }
            const validNameRegex = /^[a-zA-Z0-9\s\-_.&]+$/;
            if (!validNameRegex.test(trimmedName)) {
                return false;
            }
            const existingOrg = await this._orgRepo.findByName(trimmedName);
            const isAvailable = !existingOrg;
            this._logger.info("Organization name validation completed", {
                name: trimmedName,
                available: isAvailable,
            });
            return isAvailable;
        }
        catch (error) {
            this._logger.error("Organization name validation failed", error, { name });
            return false;
        }
    }
    _validateInput(email, organizationName) {
        if (!email || typeof email !== "string") {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Email is required");
        }
        if (!organizationName || typeof organizationName !== "string") {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization name is required");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid email format");
        }
        if (email.length > 254) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Email address is too long");
        }
        const trimmedName = organizationName.trim();
        if (trimmedName.length < 2) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization name must be at least 2 characters long");
        }
        if (trimmedName.length > 100) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization name must be less than 100 characters");
        }
    }
    _generateInvitationToken() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let token = "";
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }
};
exports.RegisterManagerUseCase = RegisterManagerUseCase;
exports.RegisterManagerUseCase = RegisterManagerUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IOtpService)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IEmailService)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.IOrgRepo)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], RegisterManagerUseCase);
//# sourceMappingURL=RegisterManagerUseCase.js.map