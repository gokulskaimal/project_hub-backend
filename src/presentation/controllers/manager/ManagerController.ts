import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ILogger } from "../../../application/interface/services/ILogger";
import { IUserRepo } from "../../../application/interface/repositories/IUserRepo";
import { IInviteRepo } from "../../../application/interface/repositories/IInviteRepo";
import { IInviteMemberUseCase } from "../../../application/interface/useCases/IInviteMemberUseCase";
import { IOrgRepo } from "../../../application/interface/repositories/IOrgRepo";
import { IProjectRepo } from "../../../application/interface/repositories/IProjectRepo";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { toUserDTO } from "../../../application/dto/UserDTO";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
import { toOrgDTO } from "../../../application/dto/OrgDTO";
import { toInviteDTO } from "../../../application/dto/InviteDTO";
import { IGetManagerAnalyticsUseCase } from "../../../application/interface/useCases/IGetManagerAnalyticsUseCase";
import { TimeFrame } from "../../../utils/DateUtils";
import {
  InviteMemberSchema,
  BulkInviteSchema,
} from "../../../application/dto/ValidationSchemas";
import { z } from "zod";

@injectable()
export class ManagerController {
  constructor(
    @inject(TYPES.ILogger) private _logger: ILogger,
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo,
    @inject(TYPES.IInviteRepo) private _inviteRepo: IInviteRepo,
    @inject(TYPES.IInviteMemberUseCase)
    private _inviteMemberUC: IInviteMemberUseCase,
    @inject(TYPES.IOrgRepo) private _orgRepo: IOrgRepo,
    @inject(TYPES.IProjectRepo) private _projectRepo: IProjectRepo,
    @inject(TYPES.IGetManagerAnalyticsUseCase)
    private _getManagerAnalyticsUC: IGetManagerAnalyticsUseCase,
  ) {}

  private sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = StatusCodes.OK,
  ): void {
    res.status(status).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  inviteMember = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const validation = InviteMemberSchema.safeParse({ ...req.body, orgId });

      if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation Error",
          errors: validation.error.format(),
        });
        return;
      }

      const { email, role, expiresIn } = validation.data;
      this._logger.info("Manager inviting member", {
        orgId,
        email,
        role,
        expiresIn,
      });

      const result = await this._inviteMemberUC.execute(
        email,
        orgId,
        req.user!.id,
        role,
        expiresIn,
      );
      const safeResult = {
        ...result,
        expiresAt: result.expiresAt.toISOString(),
      };
      this.sendSuccess(res, safeResult, COMMON_MESSAGES.INVITATION_SENT);
    },
  );

  bulkInvite = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const validation = BulkInviteSchema.safeParse({ ...req.body, orgId });

      if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation Error",
          errors: validation.error.format(),
        });
        return;
      }

      const { emails, role, expiresIn } = validation.data;
      this._logger.info("Manager bulk inviting members", {
        orgId,
        count: emails?.length,
        role,
        expiresIn,
      });

      const results = [];
      const errors = [];

      for (const email of emails) {
        try {
          const result = await this._inviteMemberUC.execute(
            email,
            orgId,
            req.user!.id,
            role,
            expiresIn,
          );
          const safeResult = {
            ...result,
            expiresAt: result.expiresAt.toISOString(),
          };
          results.push({ email, status: "success", result: safeResult });
        } catch (error) {
          this._logger.error("Bulk invite failed for email", error as Error, {
            email,
            orgId,
          });
          errors.push({
            email,
            status: "error",
            error: (error as Error).message,
          });
        }
      }

      this.sendSuccess(
        res,
        {
          successful: results,
          failed: errors,
          summary: {
            total: emails.length,
            successful: results.length,
            failed: errors.length,
          },
        },
        `Bulk invite completed`,
      );
    },
  );

  listInvitations = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const { limit = 10, page = 1, search = "", status = "ALL" } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      this._logger.info("Listing invitations with pagination", {
        orgId,
        limit,
        page,
        search,
        status,
      });

      const { invites, total } = await this._inviteRepo.findPaginated(
        Number(limit),
        offset,
        search as string,
        {
          orgId,
          status: status !== "ALL" ? (status as string) : undefined,
        },
      );

      this.sendSuccess(
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
      const orgId = req.user!.orgId!;
      this._logger.info("Cancelling invitation", { orgId, id });

      const invitation = await this._inviteRepo.findById(id);
      if (!invitation)
        throw {
          status: StatusCodes.NOT_FOUND,
          message: "Invitation not found",
        };
      if (invitation.orgId !== orgId)
        throw { status: StatusCodes.FORBIDDEN, message: "Access denied" };

      await this._inviteRepo.deleteById(id);
      this.sendSuccess(res, null, "Invitation cancelled successfully");
    },
  );

  listMembers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId;
      const managerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const offset = (page - 1) * limit;
      const { search = "", role = "ALL", status = "ALL" } = req.query;
      const { users, total } = await this._userRepo.findPaginated(
        limit,
        offset,
        search as string,
        {
          orgId,
          role: role !== "ALL" ? (role as string) : undefined,
          status: status !== "ALL" ? (status as string) : undefined,
        },
      );

      const filtered = users.filter((u) => u.id !== managerId);
      const itemsCount = total > 0 ? total - 1 : 0;

      this.sendSuccess(
        res,
        {
          items: filtered.map((user) => toUserDTO(user)),
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

      const validation = z
        .object({
          status: z.enum(["ACTIVE", "BLOCKED", "INACTIVE", "SUSPENDED"]),
        })
        .safeParse(req.body);

      if (!validation.success) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Validation Error",
          errors: validation.error.format(),
        });
        return;
      }

      const { status } = validation.data;
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;
      this._logger.info("Updating member status", {
        orgId,
        managerId,
        targetUserId: id,
        status,
      });

      if (id === managerId)
        throw {
          status: StatusCodes.BAD_REQUEST,
          message: "Cannot change your own status",
        };

      const member = await this._userRepo.findById(id);
      if (!member)
        throw { status: StatusCodes.NOT_FOUND, message: "Member not found" };
      if (member.orgId !== orgId)
        throw {
          status: StatusCodes.FORBIDDEN,
          message: "Member not in your organization",
        };

      const updatedMember = await this._userRepo.updateStatus(id, status);
      this.sendSuccess(res, toUserDTO(updatedMember), "Member status updated");
    },
  );

  removeMember = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;
      this._logger.info("Removing member", {
        orgId,
        managerId,
        targetUserId: id,
      });

      if (id === managerId)
        throw {
          status: StatusCodes.BAD_REQUEST,
          message: "Cannot remove yourself",
        };

      const member = await this._userRepo.findById(id);
      if (!member)
        throw { status: StatusCodes.NOT_FOUND, message: "Member not found" };
      if (member.orgId !== orgId)
        throw {
          status: StatusCodes.FORBIDDEN,
          message: "Member not in your organization",
        };

      await this._userRepo.delete(id);
      this.sendSuccess(res, null, "Member removed successfully");
    },
  );

  getOrganization = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      this._logger.info("Getting organization details", { orgId });

      const org = await this._orgRepo.findById(orgId);
      if (!org)
        throw {
          status: StatusCodes.NOT_FOUND,
          message: "Organization not found",
        };

      this.sendSuccess(res, toOrgDTO(org), "Organization details retrieved");
    },
  );

  getMemberStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const stats = await this._userRepo.getOrgMemberStats(orgId);
      this.sendSuccess(res, stats, "Member Statistics");
    },
  );

  getInvitationStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId;
      const stats = await this._inviteRepo.getInvitationStats(orgId);
      this.sendSuccess(res, stats, "Invitation Statistics");
    },
  );

  getDashboardStats = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const [members, invites, projects] = await Promise.all([
        this._userRepo.getOrgMemberStats(orgId),
        this._inviteRepo.getInvitationStats(orgId),
        this._projectRepo.getProjectStats(orgId),
      ]);

      this.sendSuccess(
        res,
        {
          members,
          invites,
          projects,
        },
        "Dashboard Statistics",
      );
    },
  );
  getAnalytics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const orgId = req.user!.orgId!;
      const { filter } = req.query;
      this._logger.info("Getting manager analytics", { orgId, filter });

      const analytics = await this._getManagerAnalyticsUC.execute(
        orgId,
        filter as TimeFrame,
      );
      this.sendSuccess(res, analytics, "Manager Analytics");
    },
  );
}
