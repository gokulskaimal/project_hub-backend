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
const asyncHandler_1 = require("../../utils/asyncHandler");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
let InviteMemberUseCase = class InviteMemberUseCase {
    constructor(inviteRepo, emailService, logger, orgRepo, userRepo) {
        this._inviteRepo = inviteRepo;
        this._emailService = emailService;
        this._logger = logger;
        this._orgRepo = orgRepo;
        this._userRepo = userRepo;
    }
    async execute(email, orgId, role) {
        this._logger.info("Processing member invitation", { email, orgId, role });
        try {
            this._validateInput(email, orgId);
            const organization = await this._orgRepo.findById(orgId);
            if (!organization) {
                this._logger.warn("Organization not found for invitation", { orgId });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.NOT_FOUND, "Organization not found");
            }
            const existingUser = await this._userRepo.findByEmail(email);
            if (existingUser) {
                this._logger.warn("User already exists", { email });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.CONFLICT, "User with this email already exists");
            }
            const existingInvite = await this._inviteRepo.findPendingByEmail(email, orgId);
            if (existingInvite) {
                this._logger.warn("Pending invitation already exists", {
                    email,
                    orgId,
                });
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.CONFLICT, "An invitation to this email is already pending");
            }
            const token = this._generateInvitationToken();
            const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
            // Use const assertion for status
            const inviteData = {
                email,
                orgId,
                token,
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
    async bulkInvite(emails, orgId, role) {
        this._logger.info("Processing bulk member invitations", {
            emailCount: emails.length,
            orgId,
            role,
        });
        const successful = [];
        const failed = [];
        for (const email of emails) {
            try {
                const result = await this.execute(email, orgId, role);
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
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Email is required");
        }
        if (!orgId || typeof orgId !== "string") {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization ID is required");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid email format");
        }
        if (email.length > 254) {
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Email address is too long");
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
            throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to send invitation email");
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
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], InviteMemberUseCase);
//# sourceMappingURL=InviteMemberUseCase.js.map