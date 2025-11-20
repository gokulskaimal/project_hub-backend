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
exports.AdminController = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../../infrastructure/container/types");
const Organization_1 = require("../../domain/entities/Organization");
const statusCodes_enum_1 = require("../../infrastructure/config/statusCodes.enum");
const common_constants_1 = require("../../infrastructure/config/common.constants");
/**
 * Admin Controller
 *
 * Handles administrative operations for managing organizations and users
 * Implements the presentation layer of the application architecture
 */
let AdminController = class AdminController {
    /**
     * Creates a new AdminController instance with dependency injection
     *
     * @param userRepo - User repository for user management
     * @param orgRepo - Organization repository for organization management
     * @param inviteMemberUseCase - Use case for inviting members
     * @param logger - Logging service
     */
    constructor(userRepo, orgRepo, inviteMemberUseCase, logger) {
        this.userRepo = userRepo;
        this.orgRepo = orgRepo;
        this.inviteMemberUseCase = inviteMemberUseCase;
        this.logger = logger;
    }
    /**
     * Lists all organizations with pagination and search capabilities
     *
     * @param req - Express request object with query parameters
     * @param res - Express response object
     */
    async listOrganizations(req, res) {
        try {
            const { limit = 50, offset = 0, search } = req.query;
            const result = await this.orgRepo.findPaginated(Number(limit), Number(offset), search);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            this.logger.error("List organizations failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to fetch organizations",
            });
        }
    }
    /**
     * Creates a new organization
     *
     * @param req - Express request object with organization data
     * @param res - Express response object
     */
    async createOrganization(req, res) {
        try {
            const { name, description, settings } = req.body;
            if (!name) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Organization name is required",
                });
                return;
            }
            const newOrg = await this.orgRepo.create({
                name,
                description,
                settings,
                status: Organization_1.OrganizationStatus.ACTIVE,
                createdAt: new Date(),
            });
            res.status(statusCodes_enum_1.StatusCodes.CREATED).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.CREATED,
                data: newOrg,
            });
        }
        catch (error) {
            this.logger.error("Create organization failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to create organization",
            });
        }
    }
    /**
     * Retrieves an organization by its ID
     *
     * @param req - Express request object with organization ID parameter
     * @param res - Express response object
     */
    async getOrganizationById(req, res) {
        try {
            const { id } = req.params;
            const organization = await this.orgRepo.findById(id);
            if (!organization) {
                res.status(statusCodes_enum_1.StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: common_constants_1.COMMON_MESSAGES.NOT_FOUND,
                });
                return;
            }
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                data: organization,
            });
        }
        catch (error) {
            this.logger.error("Get organization by ID failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: common_constants_1.COMMON_MESSAGES.SERVER_ERROR,
            });
        }
    }
    /**
     * Updates an existing organization
     *
     * @param req - Express request object with organization ID and update data
     * @param res - Express response object
     */
    async updateOrganization(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedOrg = await this.orgRepo.update(id, updateData);
            // If status is being changed, apply cascading effects to all users
            if (updateData.status) {
                try {
                    const usersInOrg = await this.userRepo.findByOrg(id);
                    if (usersInOrg && usersInOrg.length > 0) {
                        if (updateData.status === Organization_1.OrganizationStatus.SUSPENDED) {
                            // Suspend all users in the organization
                            for (const user of usersInOrg) {
                                try {
                                    await this.userRepo.updateStatus(user.id, "SUSPENDED");
                                    this.logger.info("User suspended due to organization suspension", {
                                        userId: user.id,
                                        orgId: id,
                                        userEmail: user.email,
                                    });
                                }
                                catch (userErr) {
                                    this.logger.error("Failed to suspend user during org suspension", userErr, {
                                        userId: user.id,
                                        orgId: id,
                                    });
                                    // Continue suspending other users even if one fails
                                }
                            }
                        }
                        else if (updateData.status === Organization_1.OrganizationStatus.ACTIVE) {
                            // Reactivate suspended users in the organization
                            for (const user of usersInOrg) {
                                if (user.status === "SUSPENDED") {
                                    try {
                                        await this.userRepo.updateStatus(user.id, "ACTIVE");
                                        this.logger.info("User reactivated due to organization activation", {
                                            userId: user.id,
                                            orgId: id,
                                            userEmail: user.email,
                                        });
                                    }
                                    catch (userErr) {
                                        this.logger.error("Failed to reactivate user during org activation", userErr, {
                                            userId: user.id,
                                            orgId: id,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                catch (cascadeErr) {
                    this.logger.error("Error applying cascading user status updates", cascadeErr, {
                        orgId: id,
                        newOrgStatus: updateData.status,
                    });
                }
            }
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.UPDATED,
                data: updatedOrg,
            });
        }
        catch (error) {
            this.logger.error("Update organization failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to update organization",
            });
        }
    }
    /**
     * Deletes an organization by its ID
     *
     * @param req - Express request object with organization ID parameter
     * @param res - Express response object
     */
    async deleteOrganization(req, res) {
        try {
            const { id } = req.params;
            // Cascade: delete all users that belong to this organization first
            const usersInOrg = await this.userRepo.findByOrg(id);
            if (usersInOrg && usersInOrg.length > 0) {
                for (const user of usersInOrg) {
                    try {
                        await this.userRepo.delete(user.id);
                        this.logger.info("User deleted due to organization deletion", {
                            userId: user.id,
                            orgId: id,
                            email: user.email,
                        });
                    }
                    catch (userDelErr) {
                        this.logger.error("Failed to delete user during organization deletion", userDelErr);
                    }
                }
            }
            await this.orgRepo.delete(id);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.DELETED,
            });
        }
        catch (error) {
            this.logger.error("Delete organization failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: common_constants_1.COMMON_MESSAGES.SERVER_ERROR,
            });
        }
    }
    /**
     * Lists all users with pagination, search, and filtering capabilities
     *
     * @param req - Express request object with query parameters
     * @param res - Express response object
     */
    async listUsers(req, res) {
        try {
            const { limit = 50, offset = 0, search, orgId, role, status } = req.query;
            const filters = {
                orgId: orgId,
                role: role,
                status: status,
            };
            const result = await this.userRepo.findPaginated(Number(limit), Number(offset), search, filters);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            this.logger.error("List users failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: common_constants_1.COMMON_MESSAGES.SERVER_ERROR,
            });
        }
    }
    /**
     * Retrieves a user by their ID
     *
     * @param req - Express request object with user ID parameter
     * @param res - Express response object
     */
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userRepo.findById(id);
            if (!user) {
                res.status(statusCodes_enum_1.StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: common_constants_1.COMMON_MESSAGES.NOT_FOUND,
                });
                return;
            }
            const { password, otp, otpExpiry, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                data: safeUser,
            });
        }
        catch (error) {
            this.logger.error("Get user by ID failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: common_constants_1.COMMON_MESSAGES.SERVER_ERROR,
            });
        }
    }
    /**
     * Updates a user's information
     *
     * @param req - Express request object with user ID and update data
     * @param res - Express response object
     */
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const { password, otp, otpExpiry, resetPasswordToken, resetPasswordExpires, ...safeUpdateData } = updateData;
            const updatedUser = await this.userRepo.updateProfile(id, safeUpdateData);
            const { password: _, otp: __, otpExpiry: ___, resetPasswordToken: ____, resetPasswordExpires: _____, ...safeUser } = updatedUser;
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.UPDATED,
                data: safeUser,
            });
        }
        catch (error) {
            this.logger.error("Update user failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: common_constants_1.COMMON_MESSAGES.SERVER_ERROR,
            });
        }
    }
    /**
     * Updates a user's status
     *
     * @param req - Express request object with user ID and status data
     * @param res - Express response object
     */
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: common_constants_1.COMMON_MESSAGES.INVALID_INPUT,
                });
                return;
            }
            const updatedUser = await this.userRepo.updateStatus(id, status);
            const { password, otp, otpExpiry, resetPasswordToken, resetPasswordExpires, ...safeUser } = updatedUser;
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.UPDATED,
                data: safeUser,
            });
        }
        catch (error) {
            this.logger.error("Update user status failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: common_constants_1.COMMON_MESSAGES.SERVER_ERROR,
            });
        }
    }
    /**
     * Deletes a user from the system
     *
     * @param req - Express request object with user ID parameter
     * @param res - Express response object
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await this.userRepo.delete(id);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.DELETED,
            });
        }
        catch (error) {
            this.logger.error("Delete user failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to delete user",
            });
        }
    }
    /**
     * Generates system reports with user and organization statistics
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async getReports(req, res) {
        try {
            const userStats = await this.userRepo.getStats();
            const orgStats = await this.orgRepo.getStats();
            const report = {
                overview: {
                    totalUsers: userStats.total || 0,
                    totalOrganizations: orgStats.total || 0,
                    generatedAt: new Date().toISOString(),
                },
                users: userStats,
                organizations: orgStats,
            };
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES,
                data: report,
            });
        }
        catch (error) {
            this.logger.error("Get reports failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: common_constants_1.COMMON_MESSAGES.SERVER_ERROR,
            });
        }
    }
    /**
     * Retrieves statistics for the admin dashboard
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    async getDashboardStats(req, res) {
        try {
            const userStats = await this.userRepo.getStats();
            const orgStats = await this.orgRepo.getStats();
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                data: {
                    users: userStats,
                    organizations: orgStats,
                },
            });
        }
        catch (error) {
            this.logger.error("Get dashboard stats failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to fetch dashboard statistics",
            });
        }
    }
    /**
     * Retrieves all users belonging to a specific organization
     *
     * @param req - Express request object with organization ID parameter
     * @param res - Express response object
     */
    async getUsersByOrganization(req, res) {
        try {
            const { orgId } = req.params;
            const users = await this.userRepo.findByOrg(orgId);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                data: users,
            });
        }
        catch (error) {
            this.logger.error("Get users by organization failed", error);
            res.status(statusCodes_enum_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: common_constants_1.COMMON_MESSAGES.SERVER_ERROR,
            });
        }
    }
    /**
     * Invites a new member to an organization
     *
     * @param req - Express request object with email, organization ID, and role
     * @param res - Express response object
     */
    async inviteMember(req, res) {
        try {
            const { email, orgId, role } = req.body;
            if (!email || !orgId) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: common_constants_1.COMMON_MESSAGES.INVALID_INPUT,
                });
                return;
            }
            const result = await this.inviteMemberUseCase.execute(email, orgId, role);
            res.status(statusCodes_enum_1.StatusCodes.CREATED).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.INVITATION_SENT,
                data: result,
            });
        }
        catch (error) {
            this.logger.error("Invite member failed", error);
            res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: error.message,
            });
        }
    }
    /**
     * Invites multiple members to an organization in bulk
     *
     * @param req - Express request object with emails array, organization ID, and role
     * @param res - Express response object
     */
    async bulkInviteMembers(req, res) {
        try {
            const { emails, orgId, role } = req.body;
            if (!emails || !Array.isArray(emails) || !orgId) {
                res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: common_constants_1.COMMON_MESSAGES.INVALID_INPUT,
                });
                return;
            }
            const result = await this.inviteMemberUseCase.bulkInvite(emails, orgId, role);
            res.status(statusCodes_enum_1.StatusCodes.OK).json({
                success: true,
                message: common_constants_1.COMMON_MESSAGES.INVITATION_SENT,
                data: result,
            });
        }
        catch (error) {
            this.logger.error("Bulk invite members failed", error);
            res.status(statusCodes_enum_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: error.message,
            });
        }
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IOrgRepo)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IInviteMemberUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AdminController);
//# sourceMappingURL=AdminController.js.map