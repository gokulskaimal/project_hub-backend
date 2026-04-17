import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ILogger } from "../../../application/interface/services/ILogger";
import { IInviteMemberUseCase } from "../../../application/interface/useCases/IInviteMemberUseCase";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { toUserDTO } from "../../../application/dto/UserDTO";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { ResponseHandler } from "../../utils/ResponseHandler";
import { asyncHandler } from "../../../utils/asyncHandler";
import { toOrgDTO } from "../../../application/dto/OrgDTO";
import { toInviteDTO } from "../../../application/dto/InviteDTO";
import { IGetManagerAnalyticsUseCase } from "../../../application/interface/useCases/IGetManagerAnalyticsUseCase";
import { TimeFrame } from "../../../utils/DateUtils";
import {
  InviteMemberSchema,
  BulkInviteSchema,
} from "../../../application/dto/ValidationSchemas";
import { z } from "zod";
import { IUserQueryUseCase } from "../../../application/interface/useCases/IUserQueryUseCase";
import { IUserManagementUseCase } from "../../../application/interface/useCases/IUserManagementUseCase";
import { IInvitationQueryUseCase } from "../../../application/interface/useCases/IInvitationQueryUseCase";
import { IGetOrgAnalyticsUseCase } from "../../../application/interface/useCases/IGetOrgAnalyticsUseCase";
import { IOrganizationQueryUseCase } from "../../../application/interface/useCases/IOrganizationQueryUseCase";

@injectable()
export class ManagerController {
  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IInviteMemberUseCase)
    private _inviteMemberUC: IInviteMemberUseCase,
    @inject(TYPES.IUserQueryUseCase) private _userQueryUC: IUserQueryUseCase,
    @inject(TYPES.IUserManagementUseCase)
    private _userManagementUC: IUserManagementUseCase,
    @inject(TYPES.IInvitationQueryUseCase)
    private _invitationQueryUC: IInvitationQueryUseCase,
    @inject(TYPES.IGetOrgAnalyticsUseCase)
    private _getOrgAnalyticsUC: IGetOrgAnalyticsUseCase,
    @inject(TYPES.IOrganizationQueryUseCase)
    private _orgQueryUC: IOrganizationQueryUseCase,
    @inject(TYPES.IGetManagerAnalyticsUseCase)
    private _getManagerAnalyticsUC: IGetManagerAnalyticsUseCase,
  ) {}

  inviteMember = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const validation = InviteMemberSchema.safeParse({ ...req.body, orgId });

      if (!validation.success) {
        return ResponseHandler.validationError(res, validation.error.format());
      }

      const { email, role, expiresIn } = validation.data;
      const result = await this._inviteMemberUC.execute(
        email,
        orgId,
        req.user!.id,
        role,
        expiresIn,
      );

      ResponseHandler.success(
        res,
        { ...result, expiresAt: result.expiresAt.toISOString() },
        COMMON_MESSAGES.INVITATION_SENT,
      );
    },
  );

  bulkInvite = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const validation = BulkInviteSchema.safeParse({ ...req.body, orgId });

      if (!validation.success) {
        return ResponseHandler.validationError(res, validation.error.format());
      }

      const { emails, role, expiresIn } = validation.data;
      const results = await this._inviteMemberUC.bulkInvite(
        emails,
        orgId,
        req.user!.id,
        role,
        expiresIn,
      );

      ResponseHandler.success(res, results, `Bulk invite completed`);
    },
  );

  listInvitations = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const { limit = 10, page = 1, search = "", status = "ALL" } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const { invites, total } = await this._invitationQueryUC.listInvitations(
        Number(limit),
        offset,
        req.user!.id,
        search as string,
        { orgId, status: status !== "ALL" ? (status as string) : undefined },
      );

      ResponseHandler.success(
        res,
        {
          items: invites.map(toInviteDTO),
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
        COMMON_MESSAGES.INVITATIONS_RETRIEVED,
      );
    },
  );

  cancelInvitation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      await this._invitationQueryUC.cancelInvitation(id, req.user!.id);
      ResponseHandler.success(res, null, "Invitation cancelled successfully");
    },
  );

  listMembers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const offset = (page - 1) * limit;
      const { search = "", role = "ALL", status = "ALL" } = req.query;

      const { users, total } = await this._userQueryUC.listUsers(
        limit,
        offset,
        req.user!.id,
        search as string,
        {
          orgId,
          role: role !== "ALL" ? (role as string) : undefined,
          status: status !== "ALL" ? (status as string) : undefined,
        },
      );

      const filtered = users.filter((u) => u.id !== req.user!.id);
      const itemsCount = total > 0 ? total - 1 : 0;

      ResponseHandler.success(
        res,
        {
          items: filtered.map(toUserDTO),
          total: itemsCount,
          page,
          limit,
          totalPages: Math.ceil(itemsCount / limit),
        },
        COMMON_MESSAGES.MEMBERS_RETRIEVED,
      );
    },
  );

  updateMemberStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const validation = z.object({ status: z.string() }).safeParse(req.body);

      if (!validation.success) {
        return ResponseHandler.validationError(res, validation.error.format());
      }

      const updatedMember = await this._userManagementUC.updateUserStatus(
        id,
        validation.data.status,
        req.user!.id,
      );
      ResponseHandler.success(
        res,
        toUserDTO(updatedMember),
        "Member status updated",
      );
    },
  );

  removeMember = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      await this._userManagementUC.deleteUser(id, req.user!.id);
      ResponseHandler.success(res, null, "Member removed successfully");
    },
  );

  getOrganization = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const org = await this._orgQueryUC.getOrganizationById(
        orgId,
        req.user!.id,
      );
      if (!org) return ResponseHandler.notFound(res, "Organization not found");
      ResponseHandler.success(
        res,
        toOrgDTO(org),
        "Organization details retrieved",
      );
    },
  );

  getMemberStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const stats = await this._getOrgAnalyticsUC.getMemberStats(
        req.user!.orgId!,
        req.user!.id,
      );
      ResponseHandler.success(res, stats, "Member Statistics");
    },
  );

  getInvitationStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const stats = await this._getOrgAnalyticsUC.getInvitationStats(
        req.user!.orgId!,
        req.user!.id,
      );
      ResponseHandler.success(res, stats, "Invitation Statistics");
    },
  );

  getDashboardStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const stats = await this._getOrgAnalyticsUC.getOrgStats(
        req.user!.orgId!,
        req.user!.id,
      );
      ResponseHandler.success(res, stats, "Dashboard Statistics");
    },
  );

  getAnalytics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const { filter } = req.query;
      const analytics = await this._getManagerAnalyticsUC.execute(
        orgId,
        filter as TimeFrame,
      );
      ResponseHandler.success(res, analytics, "Manager Analytics");
    },
  );
}
