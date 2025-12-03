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
const asyncHandler_1 = require("../../utils/asyncHandler");
let ManagerController = class ManagerController {
    constructor(_logger, _userRepo, _inviteRepo, _inviteMemberUC) {
        this._logger = _logger;
        this._userRepo = _userRepo;
        this._inviteRepo = _inviteRepo;
        this._inviteMemberUC = _inviteMemberUC;
        this.inviteMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email } = req.body;
            const orgId = req.user.orgId;
            this._logger.info("Manager inviting member", { orgId, email });
            if (!email)
                throw { status: statusCodes_enum_1.StatusCodes.BAD_REQUEST, message: "Email is required" };
            const result = await this._inviteMemberUC.execute(email, orgId);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.INVITATION_SENT);
        });
        this.bulkInvite = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { emails } = req.body;
            const orgId = req.user.orgId;
            this._logger.info("Manager bulk inviting members", {
                orgId,
                count: emails?.length,
            });
            if (!emails?.length)
                throw {
                    status: statusCodes_enum_1.StatusCodes.BAD_REQUEST,
                    message: "Emails array is required",
                };
            const results = [];
            const errors = [];
            for (const email of emails) {
                try {
                    const result = await this._inviteMemberUC.execute(email, orgId);
                    results.push({ email, status: "success", result });
                }
                catch (error) {
                    this._logger.error("Bulk invite failed for email", error, {
                        email,
                        orgId,
                    });
                    errors.push({
                        email,
                        status: "error",
                        error: error.message,
                    });
                }
            }
            this.sendSuccess(res, {
                successful: results,
                failed: errors,
                summary: {
                    total: emails.length,
                    successful: results.length,
                    failed: errors.length,
                },
            }, `Bulk invite completed`);
        });
        this.listInvitations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const orgId = req.user.orgId;
            this._logger.info("Listing invitations", { orgId });
            const invitations = (await this._inviteRepo.findByOrganization?.(orgId)) || [];
            this.sendSuccess(res, invitations, common_constants_1.COMMON_MESSAGES.INVITATIONS_RETRIEVED);
        });
        this.cancelInvitation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { token } = req.params;
            const orgId = req.user.orgId;
            this._logger.info("Cancelling invitation", { orgId, token: "REDACTED" });
            const invitation = await this._inviteRepo.findByToken(token);
            if (!invitation)
                throw {
                    status: statusCodes_enum_1.StatusCodes.NOT_FOUND,
                    message: "Invitation not found",
                };
            if (invitation.orgId !== orgId)
                throw { status: statusCodes_enum_1.StatusCodes.FORBIDDEN, message: "Access denied" };
            await this._inviteRepo.markCancelled?.(token);
            this.sendSuccess(res, null, "Invitation cancelled successfully");
        });
        this.listMembers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            this._logger.info("Listing members", { orgId, managerId });
            const users = (await this._userRepo.findByOrg?.(orgId)) || [];
            const filtered = users.filter((u) => u.id !== managerId);
            const memberDTOs = filtered.map((user) => (0, UserDTO_1.toUserDTO)(user));
            this.sendSuccess(res, memberDTOs, common_constants_1.COMMON_MESSAGES.MEMBERS_RETRIEVED);
        });
        this.updateMemberStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            this._logger.info("Updating member status", {
                orgId,
                managerId,
                targetUserId: id,
                status,
            });
            if (id === managerId)
                throw {
                    status: statusCodes_enum_1.StatusCodes.BAD_REQUEST,
                    message: "Cannot change your own status",
                };
            const member = await this._userRepo.findById(id);
            if (!member)
                throw { status: statusCodes_enum_1.StatusCodes.NOT_FOUND, message: "Member not found" };
            if (member.orgId !== orgId)
                throw {
                    status: statusCodes_enum_1.StatusCodes.FORBIDDEN,
                    message: "Member not in your organization",
                };
            const updatedMember = await this._userRepo.updateStatus(id, status);
            this.sendSuccess(res, (0, UserDTO_1.toUserDTO)(updatedMember), "Member status updated");
        });
        this.removeMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const orgId = req.user.orgId;
            const managerId = req.user.id;
            this._logger.info("Removing member", {
                orgId,
                managerId,
                targetUserId: id,
            });
            if (id === managerId)
                throw {
                    status: statusCodes_enum_1.StatusCodes.BAD_REQUEST,
                    message: "Cannot remove yourself",
                };
            const member = await this._userRepo.findById(id);
            if (!member)
                throw { status: statusCodes_enum_1.StatusCodes.NOT_FOUND, message: "Member not found" };
            if (member.orgId !== orgId)
                throw {
                    status: statusCodes_enum_1.StatusCodes.FORBIDDEN,
                    message: "Member not in your organization",
                };
            await this._userRepo.removeFromOrg(id, orgId);
            this.sendSuccess(res, null, "Member removed successfully");
        });
    }
    sendSuccess(res, data, message = "Success") {
        res
            .status(statusCodes_enum_1.StatusCodes.OK)
            .json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
        });
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