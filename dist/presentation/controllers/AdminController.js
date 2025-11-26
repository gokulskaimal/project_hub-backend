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
const asyncHandler_1 = require("../../utils/asyncHandler");
let AdminController = class AdminController {
    constructor(userRepo, orgRepo, inviteMemberUseCase, orgManagementUseCase, logger) {
        this.userRepo = userRepo;
        this.orgRepo = orgRepo;
        this.inviteMemberUseCase = inviteMemberUseCase;
        this.orgManagementUseCase = orgManagementUseCase;
        this.logger = logger;
        this.listOrganizations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { limit = 50, offset = 0, search } = req.query;
            this.logger.info("Listing organizations", { limit, offset, search });
            if (limit === undefined || offset === undefined) {
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Invalid pagination parameters");
            }
            const result = await this.orgRepo.findPaginated(Number(limit), Number(offset), search);
            this.sendSuccess(res, result);
        });
        this.createOrganization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { name, description, settings } = req.body;
            this.logger.info("Creating organization", { name });
            if (!name)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization name is required");
            if (!description)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization description is required");
            if (!settings)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization settings are required");
            const newOrg = await this.orgRepo.create({
                name,
                description,
                settings,
                status: Organization_1.OrganizationStatus.ACTIVE,
                createdAt: new Date(),
            });
            this.sendSuccess(res, newOrg, common_constants_1.COMMON_MESSAGES.CREATED, statusCodes_enum_1.StatusCodes.CREATED);
        });
        this.getOrganizationById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            this.logger.info("Fetching organization by ID", { orgId: id });
            const organization = await this.orgRepo.findById(id);
            if (!organization)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.NOT_FOUND, common_constants_1.COMMON_MESSAGES.NOT_FOUND);
            this.sendSuccess(res, organization);
        });
        this.updateOrganization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const updateData = req.body;
            this.logger.info("Updating organization", { orgId: id, updatedFields: Object.keys(updateData || {}) });
            if (!id)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization ID is required");
            if (!updateData)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Update data is required");
            // If status is being updated, use the use case to handle cascading effects
            if (updateData.status) {
                const updatedOrg = await this.orgManagementUseCase.updateOrganizationStatus(id, updateData.status);
                // If there are other fields to update besides status, update them now
                const { status, ...otherFields } = updateData;
                if (Object.keys(otherFields).length > 0) {
                    await this.orgRepo.update(id, otherFields);
                    // Re-fetch to get the final state
                    const finalOrg = await this.orgRepo.findById(id);
                    this.sendSuccess(res, finalOrg, common_constants_1.COMMON_MESSAGES.UPDATED);
                    return;
                }
                this.sendSuccess(res, updatedOrg, common_constants_1.COMMON_MESSAGES.UPDATED);
                return;
            }
            // Default update for non-status fields
            const updatedOrg = await this.orgRepo.update(id, updateData);
            this.sendSuccess(res, updatedOrg, common_constants_1.COMMON_MESSAGES.UPDATED);
        });
        this.deleteOrganization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            this.logger.info("Deleting organization", { orgId: id });
            if (!id)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "Organization ID is required");
            await this.orgManagementUseCase.deleteOrganizationCascade(id);
            this.sendSuccess(res, null, common_constants_1.COMMON_MESSAGES.DELETED);
        });
        this.listUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { limit = 50, offset = 0, search, orgId, role, status } = req.query;
            this.logger.info("Listing users", { limit, offset, search, orgId, role, status });
            // Explicitly typed filters object
            const filters = {
                orgId: typeof orgId === 'string' ? orgId : undefined,
                role: typeof role === 'string' ? role : undefined,
                status: typeof status === 'string' ? status : undefined
            };
            const result = await this.userRepo.findPaginated(Number(limit), Number(offset), search, filters);
            this.sendSuccess(res, result);
        });
        this.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            this.logger.info("Fetching user by ID", { userId: id });
            if (!id)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "User ID is required");
            const user = await this.userRepo.findById(id);
            if (!user)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.NOT_FOUND, common_constants_1.COMMON_MESSAGES.NOT_FOUND);
            const safeUser = { ...user };
            Reflect.deleteProperty(safeUser, "password");
            Reflect.deleteProperty(safeUser, "otp");
            this.sendSuccess(res, safeUser);
        });
        this.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            this.logger.info("Updating user", { userId: id });
            if (!id)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "User ID is required");
            const safeUpdateData = { ...req.body };
            Reflect.deleteProperty(safeUpdateData, "password");
            Reflect.deleteProperty(safeUpdateData, "otp");
            const updatedUser = await this.userRepo.updateProfile(id, safeUpdateData);
            const safeUser = { ...updatedUser };
            Reflect.deleteProperty(safeUser, "password");
            this.sendSuccess(res, safeUser, common_constants_1.COMMON_MESSAGES.UPDATED);
        });
        this.updateUserStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            this.logger.info("Updating user status", { userId: id, status });
            if (!id)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "User ID is required");
            if (!status)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, common_constants_1.COMMON_MESSAGES.INVALID_INPUT);
            const updatedUser = await this.userRepo.updateStatus(id, status);
            const safeUser = { ...updatedUser };
            Reflect.deleteProperty(safeUser, "password");
            this.sendSuccess(res, safeUser, common_constants_1.COMMON_MESSAGES.UPDATED);
        });
        this.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            this.logger.info("Deleting user", { userId: id });
            if (!id)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, "User ID is required");
            await this.userRepo.delete(id);
            this.sendSuccess(res, null, common_constants_1.COMMON_MESSAGES.DELETED);
        });
        this.getReports = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            this.logger.info("Fetching reports");
            const [userStats, orgStats] = await Promise.all([
                this.userRepo.getStats(),
                this.orgRepo.getStats()
            ]);
            const report = {
                overview: { totalUsers: userStats.total, totalOrganizations: orgStats.total },
                users: userStats,
                organizations: orgStats,
            };
            this.sendSuccess(res, report);
        });
        this.getDashboardStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            this.logger.info("Fetching dashboard stats");
            const [userStats, orgStats] = await Promise.all([
                this.userRepo.getStats(),
                this.orgRepo.getStats()
            ]);
            this.sendSuccess(res, { users: userStats, organizations: orgStats });
        });
        this.getUsersByOrganization = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { orgId } = req.params;
            this.logger.info("Fetching users by organization", { orgId });
            const users = await this.userRepo.findByOrg(orgId);
            this.sendSuccess(res, users);
        });
        this.inviteMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { email, orgId, role } = req.body;
            this.logger.info("Admin inviting member", { email, orgId, role });
            if (!email || !orgId)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, common_constants_1.COMMON_MESSAGES.INVALID_INPUT);
            const result = await this.inviteMemberUseCase.execute(email, orgId, role);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.INVITATION_SENT, statusCodes_enum_1.StatusCodes.CREATED);
        });
        this.bulkInviteMembers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { emails, orgId, role } = req.body;
            this.logger.info("Admin bulk inviting members", { count: emails?.length, orgId, role });
            if (!emails?.length || !orgId)
                throw new asyncHandler_1.HttpError(statusCodes_enum_1.StatusCodes.BAD_REQUEST, common_constants_1.COMMON_MESSAGES.INVALID_INPUT);
            const result = await this.inviteMemberUseCase.bulkInvite(emails, orgId, role);
            this.sendSuccess(res, result, common_constants_1.COMMON_MESSAGES.INVITATION_SENT);
        });
    }
    sendSuccess(res, data, message = "Success", status = statusCodes_enum_1.StatusCodes.OK) {
        res.status(status).json({ success: true, message, data, timestamp: new Date().toISOString() });
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.IUserRepo)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.IOrgRepo)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.IInviteMemberUseCase)),
    __param(3, (0, inversify_1.inject)(types_1.TYPES.IOrganizationManagementUseCase)),
    __param(4, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AdminController);
//# sourceMappingURL=AdminController.js.map