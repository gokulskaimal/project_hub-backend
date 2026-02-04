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
exports.AcceptUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const UserRole_1 = require("../../domain/enums/UserRole");
let AcceptUseCase = class AcceptUseCase {
    constructor(_inviteRepo, _userRepo, _logger, _hashService, _jwtService) {
        this._inviteRepo = _inviteRepo;
        this._userRepo = _userRepo;
        this._logger = _logger;
        this._hashService = _hashService;
        this._jwtService = _jwtService;
    }
    /**
     * @param token - Invitation token
     * @param password - User's chosen password
     * @param firstName - User's first name
     * @param lastName - User's last name
     * @param additionalData - Optional additional data
     * @returns User, organization, and tokens
     */
    async execute(token, password, firstName, lastName, additionalData) {
        this._logger.info("Processing invitation acceptance", {
            token: token.substring(0, 8) + "...",
            firstName,
            lastName,
        });
        try {
            // Business Rule: Validate input
            if (!token || !password || !firstName || !lastName) {
                throw new Error("Token, password, first name, and last name are required");
            }
            // Business Rule: Find and validate invitation
            const hashedToken = this._hashService.hashToken(token);
            const invite = await this._inviteRepo.findByToken(hashedToken);
            if (!invite) {
                this._logger.warn("Invitation not found", {
                    token: token.substring(0, 8) + "...",
                });
                throw new Error("Invalid invitation token");
            }
            // Business Rule: Check invitation status and expiry
            if (invite.expiry < new Date()) {
                this._logger.warn("Invitation expired", {
                    token: token.substring(0, 8) + "...",
                    expiry: invite.expiry,
                });
                throw new Error("Invitation has expired");
            }
            if (invite.status !== "PENDING") {
                this._logger.warn("Invitation not available", {
                    token: token.substring(0, 8) + "...",
                    status: invite.status,
                });
                if (invite.status === "CANCELLED") {
                    throw new Error("This invitation has been cancelled by your organization administrator");
                }
                else if (invite.status === "ACCEPTED") {
                    throw new Error("This invitation has already been used to create an account");
                }
                else if (invite.status === "EXPIRED") {
                    throw new Error("This invitation has expired. Please request a new invitation");
                }
                else {
                    throw new Error(`Invitation is not available (status: ${invite.status})`);
                }
            }
            // Business Rule: Check if user already exists
            const existingUser = await this._userRepo.findByEmail(invite.email);
            if (existingUser) {
                this._logger.warn("User already exists for invitation", {
                    email: invite.email,
                });
                throw new Error("User already exists with this email");
            }
            // Business Rule: Get organization details
            const organization = await this._userRepo.findOrganizationById?.(invite.orgId);
            if (!organization) {
                throw new Error("Organization not found");
            }
            // Business Rule: Validate password
            this._validatePassword(password);
            // Business Rule: Hash password
            const hashedPassword = await this._hashService.hash(password);
            // Create user with invitation details
            const newUser = await this._userRepo.create({
                email: invite.email,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                name: `${firstName.trim()} ${lastName.trim()}`,
                orgId: invite.orgId,
                role: invite.assignedRole || UserRole_1.UserRole.TEAM_MEMBER,
                password: hashedPassword,
                emailVerified: true, // Pre-verified through invitation
                status: "ACTIVE",
                createdAt: new Date(),
                ...additionalData,
            });
            // Generate authentication tokens
            const accessToken = this._jwtService.generateAccessToken({
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                orgId: newUser.orgId,
            });
            const refreshToken = this._jwtService.generateRefreshToken({
                id: newUser.id,
                email: newUser.email,
            });
            // Mark invitation as accepted
            await this._inviteRepo.markAccepted(hashedToken);
            this._logger.info("Invitation accepted successfully", {
                userId: newUser.id,
                email: invite.email,
                orgId: invite.orgId,
                firstName,
                lastName,
            });
            // Return safe user data (exclude sensitive fields)
            const safeUserData = {
                ...newUser,
            };
            Reflect.deleteProperty(safeUserData, "password");
            Reflect.deleteProperty(safeUserData, "resetPasswordToken");
            Reflect.deleteProperty(safeUserData, "resetPasswordExpires");
            Reflect.deleteProperty(safeUserData, "otp");
            Reflect.deleteProperty(safeUserData, "otpExpiry");
            return {
                user: safeUserData,
                organization: {
                    id: organization.id,
                    name: organization.name,
                    status: organization.status,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 15 * 60, // 15 minutes
                },
            };
        }
        catch (error) {
            this._logger.error("Failed to accept invitation", error, {
                token: token.substring(0, 8) + "...",
                firstName,
                lastName,
            });
            throw error;
        }
    }
    /**
     * @param token - Invitation token
     * @returns Validation result
     */
    async validateInvitationToken(token) {
        try {
            if (!token) {
                return { valid: false };
            }
            const hashedToken = this._hashService.hashToken(token);
            const invite = await this._inviteRepo.findByToken(hashedToken);
            if (!invite) {
                return { valid: false };
            }
            const expired = invite.expiry < new Date();
            const cancelled = invite.status === "CANCELLED";
            const accepted = invite.status === "ACCEPTED";
            const processed = invite.status !== "PENDING";
            return {
                valid: !expired && !processed,
                invitation: {
                    email: invite.email,
                    orgId: invite.orgId,
                    createdAt: invite.createdAt,
                    expiry: invite.expiry,
                    status: invite.status,
                },
                expired,
                cancelled,
                accepted,
            };
        }
        catch (error) {
            this._logger.error("Token validation failed", error);
            return { valid: false };
        }
    }
    /**
     * Validate password strength
     * @param password - Password to validate
     */
    _validatePassword(password) {
        if (!password || typeof password !== "string") {
            throw new Error("Password is required");
        }
        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new Error("Password must contain at least one lowercase letter, one uppercase letter, and one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new Error("Password must contain at least one special character");
        }
    }
};
exports.AcceptUseCase = AcceptUseCase;
exports.AcceptUseCase = AcceptUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IInviteRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.IJwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AcceptUseCase);
//# sourceMappingURL=AcceptUseCase.js.map