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
exports.ManagerController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const UserDTO_1 = require("../../application/dto/UserDTO");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
const common_constants_1 = require("../../infrastructure/config/common.constants");
/**
 * Manager Controller
 *
 * Handles operations specific to organization managers including member management
 * and invitation handling within their organization
 */
let ManagerController = class ManagerController {
    /**
     * Creates a new ManagerController instance with dependency injection
     *
     * @param logger - Logging service
     * @param userRepo - User repository for member management
     * @param inviteRepo - Invitation repository for invitation management
     * @param inviteMemberUC - Use case for inviting members
     */
    constructor(logger, userRepo, inviteRepo, inviteMemberUC) {
        this._logger = logger;
        this._userRepo = userRepo;
        this._inviteRepo = inviteRepo;
        this._inviteMemberUC = inviteMemberUC;
    }
    /**
     * Invites a new member to the manager's organization
     *
     * @param req - Authenticated request object with email in body
     * @param res - Express response object
     */
    async inviteMember(req, res) {
        try {
            const { email } = req.body;
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            if (!email) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Email is required",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("Manager inviting member", {
                managerId,
                inviteEmail: email,
                orgId,
                ip: req.ip,
            });
            const result = await this._inviteMemberUC.execute(email, orgId);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.INVITATION_SENT,
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to invite member";
            this._logger.error("Failed to invite member", err, {
                managerId: req.user?.id,
                inviteEmail: req.body.email,
                orgId: req.user?.orgId,
                ip: req.ip,
            });
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Invites multiple members to the manager's organization in bulk
     *
     * @param req - Authenticated request object with emails array in body
     * @param res - Express response object
     */
    async bulkInvite(req, res) {
        try {
            const { emails } = req.body;
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            if (!emails || !Array.isArray(emails) || emails.length === 0) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Emails array is required",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("Manager bulk inviting members", {
                managerId,
                emailCount: emails.length,
                orgId,
                ip: req.ip,
            });
            const results = [];
            const errors = [];
            for (const email of emails) {
                try {
                    const result = await this._inviteMemberUC.execute(email, orgId);
                    results.push({ email, status: "success", result });
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    errors.push({ email, status: "error", error: errorMessage });
                }
            }
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: `Bulk invite completed. ${results.length} successful, ${errors.length} failed`,
                data: {
                    successful: results,
                    failed: errors,
                    summary: {
                        total: emails.length,
                        successful: results.length,
                        failed: errors.length,
                    },
                },
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to bulk invite members";
            this._logger.error("Failed to bulk invite members", err, {
                managerId: req.user?.id,
                orgId: req.user?.orgId,
                ip: req.ip,
            });
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Lists all invitations for the manager's organization
     *
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    async listInvitations(req, res) {
        try {
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            this._logger.info("Manager listing invitations", {
                managerId,
                orgId,
                ip: req.ip,
            });
            const invitations = (await this._inviteRepo.findByOrganization?.(orgId)) || [];
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.INVITATIONS_RETRIEVED,
                data: invitations,
                count: invitations.length,
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to retrieve invitations";
            this._logger.error("Failed to list invitations", err, {
                managerId: req.user?.id,
                orgId: req.user?.orgId,
                ip: req.ip,
            });
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Cancels a pending invitation
     *
     * @param req - Authenticated request object with invitation token parameter
     * @param res - Express response object
     */
    async cancelInvitation(req, res) {
        try {
            const { token } = req.params;
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            if (!token) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Invitation token is required",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("Manager cancelling invitation", {
                managerId,
                token: token.substring(0, 10) + "...",
                orgId,
                ip: req.ip,
            });
            const invitation = await this._inviteRepo.findByToken(token);
            if (!invitation) {
                res.status(statusCodes_enum_1.StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Invitation not found",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Verify invitation belongs to same organization
            if (invitation.orgId !== orgId) {
                res.status(statusCodes_enum_1.StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: "Access denied: Invitation does not belong to your organization",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Cancel the invitation
            await this._inviteRepo.markCancelled?.(token);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: "Invitation cancelled successfully",
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to cancel invitation";
            this._logger.error("Failed to cancel invitation", err, {
                managerId: req.user?.id,
                token: req.params.token,
                orgId: req.user?.orgId,
                ip: req.ip,
            });
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * List organization members - Manager only
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    async listMembers(req, res) {
        try {
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            if (!orgId) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Organization ID not found in user context",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("Manager listing organization members", {
                managerId,
                orgId,
                ip: req.ip,
            });
            // Use findByOrg method if available, fallback to empty array
            const users = (await this._userRepo.findByOrg?.(orgId)) || [];
            // Exclude the current manager from the list
            const filtered = users.filter((u) => u.id !== managerId);
            // Convert to DTOs (hide sensitive data)
            const memberDTOs = filtered.map((user) => (0, UserDTO_1.toUserDTO)(user));
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.MEMBERS_RETRIEVED,
                data: memberDTOs,
                count: memberDTOs.length,
                orgId,
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error
                ? err.message
                : "Failed to retrieve organization members";
            this._logger.error("Failed to list organization members", err, {
                managerId: req.user?.id,
                orgId: req.user?.orgId,
                ip: req.ip,
            });
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Update member status - Manager only
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    async updateMemberStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            if (!id || !status) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Member ID and status are required",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Prevent manager from changing their own status
            if (id === managerId) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "You cannot change your own status",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("Manager updating member status", {
                managerId,
                targetMemberId: id,
                newStatus: status,
                orgId,
                ip: req.ip,
            });
            const member = await this._userRepo.findById(id);
            if (!member) {
                res.status(statusCodes_enum_1.StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Member not found",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Verify member belongs to same organization
            if (member.orgId !== orgId) {
                res.status(statusCodes_enum_1.StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: "Access denied: Member does not belong to your organization",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Update member status through repository
            const updatedMember = await this._userRepo.updateStatus(id, status);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: "Member status updated successfully",
                data: (0, UserDTO_1.toUserDTO)(updatedMember),
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update member status";
            this._logger.error("Failed to update member status", err, {
                managerId: req.user?.id,
                targetMemberId: req.params.id,
                orgId: req.user?.orgId,
                ip: req.ip,
            });
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Remove member from organization - Manager only
     * @param req - Authenticated request object
     * @param res - Express response object
     */
    async removeMember(req, res) {
        try {
            const { id } = req.params;
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            if (!id) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Member ID is required",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Prevent manager from removing themselves
            if (id === managerId) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Cannot remove yourself from the organization",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            this._logger.info("Manager removing member", {
                managerId,
                targetMemberId: id,
                orgId,
                ip: req.ip,
            });
            const member = await this._userRepo.findById(id);
            if (!member) {
                res.status(statusCodes_enum_1.StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Member not found",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Verify member belongs to same organization
            if (member.orgId !== orgId) {
                res.status(statusCodes_enum_1.StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: "Access denied: Member does not belong to your organization",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            // Remove member through repository
            await this._userRepo.removeFromOrg(id, orgId);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: "Member removed from organization successfully",
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "Failed to remove member";
            this._logger.error("Failed to remove member", err, {
                managerId: req.user?.id,
                targetMemberId: req.params.id,
                orgId: req.user?.orgId,
                ip: req.ip,
            });
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: message,
                timestamp: new Date().toISOString(),
            });
        }
    }
};
exports.ManagerController = ManagerController;
exports.ManagerController = ManagerController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IInviteRepo)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IInviteMemberUseCase)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ManagerController);
//# sourceMappingURL=ManagerController.js.map