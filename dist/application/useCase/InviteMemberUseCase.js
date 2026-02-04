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
exports.InviteMemberUseCase = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const CommonErrors_1 = require("../../domain/errors/CommonErrors");
const CommonErrors_2 = require("../../domain/errors/CommonErrors");
const AuthErrors_1 = require("../../domain/errors/AuthErrors");
let InviteMemberUseCase = class InviteMemberUseCase {
    constructor(_inviteRepo, _emailService, _logger, _orgRepo, _userRepo, _subRepo, _planRepo, _hashService) {
        this._inviteRepo = _inviteRepo;
        this._emailService = _emailService;
        this._logger = _logger;
        this._orgRepo = _orgRepo;
        this._userRepo = _userRepo;
        this._subRepo = _subRepo;
        this._planRepo = _planRepo;
        this._hashService = _hashService;
    }
    async execute(email, orgId, role, expiresIn = 1) {
        this._logger.info("Processing member invitation", { email, orgId, role });
        try {
            this._validateInput(email, orgId);
            const organization = await this._orgRepo.findById(orgId);
            if (!organization) {
                this._logger.warn("Organization not found for invitation", { orgId });
                throw new AuthErrors_1.OrganizationNotFoundError();
            }
            // Check Plan Limits
            if (organization.createdBy) {
                const subscription = await this._subRepo.findByUserId(organization.createdBy); // Owner pays
                if (subscription) {
                    const plan = await this._planRepo.findById(subscription.planId);
                    if (plan && plan.limits && plan.limits.members !== -1) {
                        const currentMembers = await this._userRepo.countByOrg(orgId);
                        if (currentMembers >= plan.limits.members) {
                            throw new CommonErrors_1.QuotaExceededError(`Member limit of ${plan.limits.members} reached for this plan.`);
                        }
                    }
                }
            }
            const existingUser = await this._userRepo.findByEmail(email);
            if (existingUser) {
                this._logger.warn("User already exists", { email });
                throw new CommonErrors_2.ConflictError("User with this email already exists");
            }
            const existingInvite = await this._inviteRepo.findPendingByEmail(email, orgId);
            if (existingInvite) {
                this._logger.warn("Pending invitation already exists", {
                    email,
                    orgId,
                });
                throw new CommonErrors_2.ConflictError("An invitation to this email is already pending");
            }
            const token = this._generateInvitationToken();
            const hashedToken = await this._hashService.hashToken(token);
            const expiry = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
            // Use const assertion for status
            const inviteData = {
                email,
                orgId,
                token: hashedToken,
                status: "PENDING",
                expiry,
                role: role || "TEAM_MEMBER",
                createdAt: new Date(),
            };
            const invitation = await this._inviteRepo.create(inviteData);
            await this._sendInvitationEmail(email, token, organization.name);
            this._logger.info("Member invitation sent successfully", {
                email,
                orgId,
                orgName: organization.name,
                expiresAt: expiry,
                invitationId: invitation.id,
            });
            return {
                invitationId: invitation.id,
                token,
                expiresAt: expiry,
                message: "Invitation sent successfully",
            };
        }
        catch (error) {
            this._logger.error("Failed to send member invitation", error, {
                email,
                orgId,
            });
            throw error;
        }
    }
    async bulkInvite(emails, orgId, role, expiresIn) {
        this._logger.info("Processing bulk member invitations", {
            emailCount: emails.length,
            orgId,
            role,
        });
        const successful = [];
        const failed = [];
        for (const email of emails) {
            try {
                const result = await this.execute(email, orgId, role, expiresIn);
                successful.push({
                    email,
                    invitationId: result.invitationId,
                });
                this._logger.info("Bulk invitation successful for email", { email });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                failed.push({
                    email,
                    error: errorMessage,
                });
                this._logger.warn("Bulk invitation failed for email", {
                    email,
                    error: errorMessage,
                });
            }
        }
        const summary = {
            total: emails.length,
            successful: successful.length,
            failed: failed.length,
        };
        this._logger.info("Bulk invitations completed", summary);
        return {
            successful,
            failed,
            summary,
        };
    }
    _validateInput(email, orgId) {
        if (!email || typeof email !== "string") {
            throw new CommonErrors_2.ValidationError("Email is required");
        }
        if (!orgId || typeof orgId !== "string") {
            throw new CommonErrors_2.ValidationError("Organization ID is required");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new CommonErrors_2.ValidationError("Invalid email format");
        }
        if (email.length > 254) {
            throw new CommonErrors_2.ValidationError("Email address is too long");
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
    async _sendInvitationEmail(email, token, orgName) {
        try {
            await this._emailService.sendInviteEmail(email, token, orgName, "Organization Manager");
            this._logger.info("Invitation email sent", { email, orgName });
        }
        catch (error) {
            this._logger.error("Failed to send invitation email", error, {
                email,
                orgName,
            });
            // Throw standard Error for internal failures, middleware will handle as 500
            throw new Error("Failed to send invitation email");
        }
    }
};
exports.InviteMemberUseCase = InviteMemberUseCase;
exports.InviteMemberUseCase = InviteMemberUseCase = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IInviteRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IEmailService)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IOrgRepo)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(5, (0, inversify_1.inject)(types_1.TYPES.ISubscriptionRepo)),
    __param(6, (0, inversify_1.inject)(types_1.TYPES.IPlanRepo)),
    __param(7, (0, inversify_1.inject)(types_1.TYPES.IHashService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], InviteMemberUseCase);
//# sourceMappingURL=InviteMemberUseCase.js.map