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
exports.InviteSignupUseCase = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const UserRole_1 = require("../../domain/enums/UserRole");
/**
 * Invite Signup Use Case - Application Layer
 * Handles signup through invitation flow
 *
 * ✅ DEPENDENCY INVERSION PRINCIPLE:
 * - Implements IInviteSignupUseCase interface (abstraction)
 * - Depends on interfaces only, not concrete implementations
 * - All dependencies injected through constructor
 */
let InviteSignupUseCase = class InviteSignupUseCase {
    constructor(userRepo, orgRepo, logger, hashService) {
        this._userRepo = userRepo;
        this._orgRepo = orgRepo;
        this._logger = logger;
        this._hashService = hashService;
    }
    execute(inviteToken, userData) {
        throw new Error("Method not implemented.");
    }
    getInvitationDetails(token) {
        throw new Error("Method not implemented.");
    }
    /**
     * Sign up user through invitation
     * @param email - User email
     * @param password - User password
     * @param orgId - Organization identifier
     * @param role - User role
     * @returns Created user data
     */
    async signup(email, password, orgId, role) {
        this._logger.info("Invite signup attempt", { email, orgId, role });
        try {
            // Business Rule: Validate input
            this._validateInput(email, password, orgId, role);
            // Business Rule: Check if user already exists
            const existingUser = await this._userRepo.findByEmail(email);
            if (existingUser) {
                this._logger.warn("User already exists for invite signup", { email });
                throw new Error("User already exists with this email address");
            }
            // Business Rule: Verify organization exists
            const organization = await this._orgRepo.findById(orgId);
            if (!organization) {
                this._logger.warn("Organization not found for invite signup", {
                    orgId,
                });
                throw new Error("Organization not found");
            }
            // Business Rule: Check organization status
            if (organization.status === "INACTIVE" ||
                organization.status === "SUSPENDED") {
                this._logger.warn("Signup attempted for inactive organization", {
                    orgId,
                    status: organization.status,
                });
                throw new Error("Organization is not currently accepting new members");
            }
            // Business Rule: Validate role permissions
            this._validateRolePermissions(role, organization);
            // Business Rule: Hash password
            const hashedPassword = await this._hashService.hash(password);
            // Create user with invitation details
            const newUser = await this._userRepo.create({
                email,
                password: hashedPassword,
                orgId,
                role,
                emailVerified: false, // Will need to verify via email
                status: "PENDING_VERIFICATION",
                createdAt: new Date(),
            });
            this._logger.info("Invite signup completed successfully", {
                userId: newUser.id,
                email,
                orgId,
                orgName: organization.name,
                role,
            });
            // Return safe user data (exclude sensitive fields)
            const { password: _, resetPasswordToken, resetPasswordExpires, otp, otpExpiry, ...safeUserData } = newUser;
            return safeUserData;
        }
        catch (error) {
            this._logger.error("Invite signup failed", error, {
                email,
                orgId,
                role,
            });
            throw error;
        }
    }
    /**
     * Sign up user with pre-verified email (through invitation token)
     * @param email - User email
     * @param password - User password
     * @param name - User full name
     * @param orgId - Organization identifier
     * @param role - User role
     * @returns Created user data
     */
    async signupWithVerifiedEmail(email, password, name, orgId, role) {
        this._logger.info("Verified invite signup attempt", {
            email,
            orgId,
            role,
            name,
        });
        try {
            // Business Rule: Validate input
            this._validateInputWithName(email, password, name, orgId, role);
            // Business Rule: Check if user already exists
            const existingUser = await this._userRepo.findByEmail(email);
            if (existingUser) {
                this._logger.warn("User already exists for verified invite signup", {
                    email,
                });
                throw new Error("User already exists with this email address");
            }
            // Business Rule: Verify organization exists
            const organization = await this._orgRepo.findById(orgId);
            if (!organization) {
                this._logger.warn("Organization not found for verified invite signup", {
                    orgId,
                });
                throw new Error("Organization not found");
            }
            // Business Rule: Hash password
            const hashedPassword = await this._hashService.hash(password);
            // Create user with verified email
            const newUser = await this._userRepo.create({
                email,
                name: name.trim(),
                password: hashedPassword,
                orgId,
                role,
                emailVerified: true, // Pre-verified through invitation
                status: "ACTIVE",
                createdAt: new Date(),
            });
            this._logger.info("Verified invite signup completed successfully", {
                userId: newUser.id,
                email,
                name,
                orgId,
                orgName: organization.name,
                role,
            });
            // Return safe user data
            const { password: _, resetPasswordToken, resetPasswordExpires, otp, otpExpiry, ...safeUserData } = newUser;
            return safeUserData;
        }
        catch (error) {
            this._logger.error("Verified invite signup failed", error, {
                email,
                name,
                orgId,
                role,
            });
            throw error;
        }
    }
    /**
     * Validate input parameters
     * @param email - Email to validate
     * @param password - Password to validate
     * @param orgId - Organization ID to validate
     * @param role - Role to validate
     */
    _validateInput(email, password, orgId, role) {
        if (!email || typeof email !== "string") {
            throw new Error("Email is required");
        }
        if (!password || typeof password !== "string") {
            throw new Error("Password is required");
        }
        if (!orgId || typeof orgId !== "string") {
            throw new Error("Organization ID is required");
        }
        if (!role || !Object.values(UserRole_1.UserRole).includes(role)) {
            throw new Error("Valid role is required");
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }
        // Validate password strength
        this._validatePassword(password);
    }
    /**
     * Validate input parameters with name
     * @param email - Email to validate
     * @param password - Password to validate
     * @param name - Name to validate
     * @param orgId - Organization ID to validate
     * @param role - Role to validate
     */
    _validateInputWithName(email, password, name, orgId, role) {
        this._validateInput(email, password, orgId, role);
        if (!name || typeof name !== "string") {
            throw new Error("Name is required");
        }
        if (name.trim().length < 2) {
            throw new Error("Name must be at least 2 characters long");
        }
        if (name.trim().length > 100) {
            throw new Error("Name must be less than 100 characters long");
        }
    }
    /**
     * Validate password strength
     * @param password - Password to validate
     */
    _validatePassword(password) {
        if (password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }
        if (password.length > 128) {
            throw new Error("Password must be less than 128 characters long");
        }
        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            throw new Error("Password must contain at least one lowercase letter");
        }
        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            throw new Error("Password must contain at least one uppercase letter");
        }
        // Check for at least one number
        if (!/\d/.test(password)) {
            throw new Error("Password must contain at least one number");
        }
    }
    /**
     * Validate role permissions for organization
     * @param role - Role to validate
     * @param organization - Organization context
     */
    _validateRolePermissions(role, organization) {
        // Business Rule: Only certain roles can be assigned through invitation
        const allowedRoles = [UserRole_1.UserRole.TEAM_MEMBER, UserRole_1.UserRole.ORG_MANAGER];
        if (!allowedRoles.includes(role)) {
            throw new Error(`Role ${role} cannot be assigned through invitation`);
        }
        // Business Rule: Check organization-specific role limits (if applicable)
        if (role === UserRole_1.UserRole.ORG_MANAGER && organization.maxManagers) {
            // Could implement manager limit check here
            this._logger.info("Manager role assignment", {
                orgId: organization.id,
                maxManagers: organization.maxManagers,
            });
        }
    }
};
exports.InviteSignupUseCase = InviteSignupUseCase;
exports.InviteSignupUseCase = InviteSignupUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IOrgRepo)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], InviteSignupUseCase);
//# sourceMappingURL=InviteSignupUseCase.js.map