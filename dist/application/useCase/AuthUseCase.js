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
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const Organization_1 = require("../../domain/entities/Organization");
const UserDTO_1 = require("../dto/UserDTO");
const UserRole_1 = require("../../domain/enums/UserRole");
const asyncHandler_1 = require("../../utils/asyncHandler");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
let AuthUseCases = class AuthUseCases {
    constructor(_userRepo, _hashService, _jwtService, _googleAuthService, _resetPasswordUseCase, _logger, _orgRepo) {
        this._userRepo = _userRepo;
        this._hashService = _hashService;
        this._jwtService = _jwtService;
        this._googleAuthService = _googleAuthService;
        this._resetPasswordUseCase = _resetPasswordUseCase;
        this._logger = _logger;
        this._orgRepo = _orgRepo;
    }
    /**
     * Helper: normalize args for login
     */
    normalizeLoginArgs(args) {
        if (Array.isArray(args)) {
            return { email: args[0], password: args[1] };
        }
        return args;
    }
    normalizeRegisterArgs(args) {
        if (Array.isArray(args)) {
            return { email: args[0], password: args[1], name: args[2] };
        }
        return args;
    }
    /**
     * REGISTER
     * Creates a new user, hashes password, returns a public user view and tokens.
     */
    async register(email, password, name) {
        const existing = await this._userRepo.findByEmail(email);
        if (existing) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.CONFLICT, "Email already in use");
        }
        const hashed = await this._hashService.hash(password);
        // Create domain user
        const created = await this._userRepo.create({
            email,
            password: hashed,
            name,
            status: "ACTIVE",
            emailVerified: false, // depends on your flow
            createdAt: new Date(),
        });
        // Optionally sign tokens. If you prefer not to sign on register, remove these.
        const payload = {
            id: created.id,
            email: created.email,
            role: created.role,
            orgId: created.orgId ?? null,
        };
        const accessToken = this._jwtService.generateAccessToken(payload);
        const refreshToken = this._jwtService.generateRefreshToken(payload);
        const publicUser = (0, UserDTO_1.toUserDTO)(created);
        this._logger.info("User registered", { userId: created.id, email });
        return {
            user: publicUser,
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
            },
        };
    }
    async googleSignIn(idToken, inviteToken, orgName) {
        const payload = await this._googleAuthService.verifyToken(idToken);
        const email = payload.email;
        const emailVerified = payload.email_verified;
        const googleSub = payload.sub;
        if (!email)
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Google Token missing email");
        let user = await this._userRepo.findByEmail(email);
        if (user) {
            // Existing user - update Google info if needed
            if (!user.googleId && user.password) {
                await this._userRepo.updateProfile(user.id, {
                    provider: "google",
                    googleId: googleSub,
                    emailVerified: emailVerified,
                });
                user = await this._userRepo.findById(user.id);
            }
        }
        else {
            // New user - check if coming from invite
            // New user - check if coming from invite
            if (inviteToken) {
                const invitePayload = this._jwtService.verifyAccessToken(inviteToken);
                if (!invitePayload) {
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid or expired invite token");
                }
                const orgId = invitePayload.orgId;
                if (!orgId || typeof orgId !== 'string') {
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid organization in invite token");
                }
                const assignedRole = Object.values(UserRole_1.UserRole).includes(invitePayload.role)
                    ? invitePayload.role
                    : UserRole_1.UserRole.TEAM_MEMBER;
                const org = await this._orgRepo.findById(orgId);
                if (!org) {
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid Organization");
                }
                const newUser = await this._userRepo.create({
                    email,
                    emailVerified: emailVerified,
                    provider: "google",
                    googleId: googleSub,
                    name: payload.name ||
                        `${payload.given_name || " "} ${payload.family_name || " "}`.trim(),
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    avatar: payload.picture,
                    orgId: orgId,
                    role: assignedRole,
                    // Team member when coming from invite
                    status: "ACTIVE",
                    password: "",
                    createdAt: new Date(),
                });
                user = newUser;
                this._logger.info("New user created from invite via Google", {
                    userId: newUser.id,
                    email,
                    inviteToken: inviteToken.substring(0, 8) + "...",
                });
            }
            else {
                // Normal signup - REQUIRES Organization Name
                if (!orgName) {
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization Name Required");
                }
                // Create Organization
                const newOrg = await this._orgRepo.create({
                    name: orgName,
                    status: Organization_1.OrganizationStatus.ACTIVE,
                    createdAt: new Date(),
                    // You might want to add more default fields here
                });
                // Create User as ORG_MANAGER linked to new Org
                const newUser = await this._userRepo.create({
                    email,
                    emailVerified: emailVerified,
                    provider: "google",
                    googleId: googleSub,
                    name: payload.name ||
                        `${payload.given_name || " "} ${payload.family_name || " "}`.trim(),
                    firstName: payload.given_name,
                    lastName: payload.family_name,
                    avatar: payload.picture,
                    role: UserRole_1.UserRole.ORG_MANAGER,
                    orgId: newOrg.id, // Link to created org
                    status: "ACTIVE",
                    password: "",
                    createdAt: new Date(),
                });
                user = newUser;
                this._logger.info("New user created as org manager via Google", {
                    userId: newUser.id,
                    email,
                    orgId: newOrg.id,
                });
            }
        }
        // Generate tokens
        if (!user) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR, "User creation failed");
        }
        if (user.status !== "ACTIVE") {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Account suspended or disabled");
        }
        if (user.orgId) {
            const org = await this._orgRepo.findById(user.orgId);
            if (org && org.status !== Organization_1.OrganizationStatus.ACTIVE) {
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Organization suspended or disabled");
            }
        }
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            orgId: user.orgId ?? null,
        };
        const accessToken = this._jwtService.generateAccessToken(tokenPayload);
        const refreshToken = this._jwtService.generateRefreshToken(tokenPayload);
        const publicUser = (0, UserDTO_1.toUserDTO)(user);
        this._logger.info("Google sign-in successful", {
            userId: user.id,
            email,
            isInviteSignup: !!inviteToken,
            role: user.role,
        });
        return {
            user: publicUser,
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: 3600,
            },
        };
    }
    /**
     * LOGIN - accepts either (email, password) or {email, password}
     * Returns shape expected by controller: { user, accessToken, refreshToken }
     */
    async login(email, password) {
        this._logger.info("User login attempt", { email });
        try {
            // Super-admin check (env)
            const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
            const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
            if (superAdminEmail &&
                superAdminPassword &&
                email === superAdminEmail &&
                password === superAdminPassword) {
                const superAdminPayload = {
                    id: "super_admin",
                    email,
                    role: UserRole_1.UserRole.SUPER_ADMIN,
                    emailVerified: true,
                    status: "ACTIVE",
                    orgId: null,
                    createdAt: new Date().toISOString(),
                };
                const accessToken = this._jwtService.generateAccessToken(superAdminPayload);
                const refreshToken = this._jwtService.generateRefreshToken(superAdminPayload);
                return {
                    user: superAdminPayload,
                    tokens: {
                        accessToken,
                        refreshToken,
                    },
                };
            }
            const user = await this._userRepo.findByEmail(email);
            if (!user)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.UNAUTHORIZED, "Invalid credentials");
            if (!user.emailVerified)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Email not verified");
            if (user.status !== "ACTIVE") {
                this._logger.warn("Login attempt by blocked/suspended user", {
                    userId: user.id,
                    email,
                    status: user.status,
                });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Account suspended or disabled");
            }
            if (user.orgId) {
                const org = await this._orgRepo.findById(user.orgId);
                if (!org) {
                    this._logger.warn("Login attempt for user with deleted org", {
                        userId: user.id,
                        orgId: user.orgId,
                    });
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Organization does not exist");
                }
                if (org.status !== Organization_1.OrganizationStatus.ACTIVE) {
                    this._logger.warn("Login attempt by user from suspended org", {
                        userId: user.id,
                        orgId: user.orgId,
                        orgStatus: org.status,
                    });
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Organization suspended or disabled");
                }
            }
            const isPasswordValid = await this._hashService.compare(password, user.password);
            if (!isPasswordValid)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.UNAUTHORIZED, "Invalid credentials");
            const payload = {
                id: user.id,
                email: user.email,
                role: user.role,
                orgId: user.orgId,
            };
            const accessToken = this._jwtService.generateAccessToken(payload);
            const refreshToken = this._jwtService.generateRefreshToken(payload);
            await this._userRepo.updateLastLogin(user.id, new Date());
            this._logger.info("User login successful", { userId: user.id, email });
            // sanitize user before returning
            const publicUser = (0, UserDTO_1.toUserDTO)(user);
            return {
                user: publicUser,
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: 3600,
                },
            };
        }
        catch (error) {
            this._logger.error("User login failed", error, { email });
            throw error;
        }
    }
    /**
     * REFRESH - accept refresh token string or object
     * Returns new access token (and optionally new refresh token if your jwtService rotates)
     */
    async refresh(refreshToken) {
        try {
            const payload = this._jwtService.verifyRefreshToken(refreshToken);
            if (!payload)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.UNAUTHORIZED, "Invalid refresh token");
            const user = await this._userRepo.findById(payload.id);
            if (!user)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.NOT_FOUND, "User not found");
            if (user.status !== "ACTIVE") {
                this._logger.warn("Token refresh attempt by blocked user", {
                    userId: user.id,
                    status: user.status,
                });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Account suspended or disabled");
            }
            if (user.orgId) {
                const org = await this._orgRepo.findById(user.orgId);
                if (!org) {
                    this._logger.warn("Token refresh: org not found", {
                        userId: user.id,
                        orgId: user.orgId,
                    });
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Organization not found");
                }
                if (org.status !== Organization_1.OrganizationStatus.ACTIVE) {
                    this._logger.warn("Token refresh by user from suspended org", {
                        userId: user.id,
                        orgId: user.orgId,
                        orgStatus: org.status,
                    });
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Organization suspended or disabled");
                }
            }
            const newPayload = {
                id: user.id,
                email: user.email,
                role: user.role,
                orgId: user.orgId ?? null,
            };
            const accessToken = this._jwtService.generateAccessToken(newPayload);
            const newRefresh = this._jwtService.generateRefreshToken(newPayload);
            return { accessToken, refreshToken: newRefresh, expiresIn: 3600 };
        }
        catch (error) {
            this._logger.error("Token refresh failed", error);
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.UNAUTHORIZED, "Invalid refresh token");
        }
    }
    /**
     * LOGOUT - revoke refresh token if service supports revocation
     */
    async logout(refreshToken, userId) {
        try {
            if (refreshToken &&
                typeof this._jwtService.revokeRefreshToken === "function") {
                await this._jwtService.revokeRefreshToken(refreshToken);
            }
            // optionally revoke all tokens for a userId if provided
            if (userId && typeof this._jwtService.revokeAllForUser === "function") {
                await this._jwtService.revokeAllForUser(userId);
            }
            this._logger.info("User logged out", { userId });
        }
        catch (error) {
            this._logger.error("Logout failed", error, { userId });
            throw error;
        }
    }
    /**
     * Validate access token and return safe user DTO
     */
    async validateToken(token) {
        try {
            const payload = this._jwtService.verifyAccessToken(token);
            if (!payload)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.UNAUTHORIZED, "Invalid token");
            const user = await this._userRepo.findById(payload.id);
            if (!user)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.NOT_FOUND, "User not found");
            if (user.status !== "ACTIVE")
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "User suspended");
            if (user.orgId) {
                const org = await this._orgRepo.findById(user.orgId);
                if (!org)
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Organization not found");
                if (org.status !== Organization_1.OrganizationStatus.ACTIVE)
                    throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.FORBIDDEN, "Organization suspended");
            }
            return (0, UserDTO_1.toUserDTO)(user);
        }
        catch (error) {
            this._logger.error("Token validation failed", error);
            throw error;
        }
    }
    /**
     * Password reset delegations
     */
    async resetPasswordReq(email) {
        return this._resetPasswordUseCase.requestReset(email);
    }
    async resetPassword(token, newPassword) {
        return this._resetPasswordUseCase.resetWithToken(token, newPassword);
    }
    /**
     * Verify email token (assumes token payload contains id)
     */
    async verifyEmail(token) {
        try {
            // you may prefer a dedicated verification token signed by jwtService
            const payload = this._jwtService.verifyAccessToken(token);
            if (!payload)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid verification token");
            const user = await this._userRepo.findById(payload.id);
            if (!user)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.NOT_FOUND, "User not found");
            if (user.emailVerified)
                return { message: "Already verified", verified: true };
            await this._userRepo.verifyEmail(user.id);
            this._logger.info("Email verified", { userId: user.id });
            return { message: "Email verified", verified: true };
        }
        catch (error) {
            this._logger.error("Email verification failed", error);
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid or expired verification token");
        }
    }
    // Backwards compatibility: keep old method name if other parts call it
    async refreshToken(refreshToken) {
        return this.refresh(refreshToken);
    }
};
exports.AuthUseCases = AuthUseCases;
exports.AuthUseCases = AuthUseCases = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IJwtService)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IGoogleAuthService)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.IResetPasswordUseCase)),
    __param(5, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(6, (0, inversify_1.inject)(types_1.TYPES.IOrgRepo)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], AuthUseCases);
//# sourceMappingURL=AuthUseCase.js.map