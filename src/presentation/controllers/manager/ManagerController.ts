import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../../infrastructure/container/types";
import { ILogger } from "../../../infrastructure/interface/services/ILogger";
import { IUserRepo } from "../../../infrastructure/interface/repositories/IUserRepo";
import { IInviteRepo } from "../../../infrastructure/interface/repositories/IInviteRepo";
import { IInviteMemberUseCase } from "../../../application/interface/useCases/IInviteMemberUseCase";
import { IOrgRepo } from "../../../infrastructure/interface/repositories/IOrgRepo";
import { AuthenticatedRequest } from "../../middleware/types/AuthenticatedRequest";
import { toUserDTO } from "../../../application/dto/UserDTO";
import { StatusCodes } from "../../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../../infrastructure/config/common.constants";
import { asyncHandler } from "../../middleware/ErrorMiddleware";
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
  ) {}

  private sendSuccess<T>(res: Response, data: T, message: string = "Success") {
    res.status(StatusCodes.OK).json({
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

      const { email } = validation.data;
      this._logger.info("Manager inviting member", { orgId, email });

      const result = await this._inviteMemberUC.execute(email, orgId);
      this.sendSuccess(res, result, COMMON_MESSAGES.INVITATION_SENT);
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

      const { emails } = validation.data;
      this._logger.info("Manager bulk inviting members", {
        orgId,
        count: emails?.length,
      });

      const results = [];
      const errors = [];

      for (const email of emails) {
        try {
          const result = await this._inviteMemberUC.execute(email, orgId);
          results.push({ email, status: "success", result });
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
      this._logger.info("Listing invitations", { orgId });
      const invitations =
        (await this._inviteRepo.findByOrganization?.(orgId)) || [];
      this.sendSuccess(res, invitations, COMMON_MESSAGES.INVITATIONS_RETRIEVED);
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
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;
      this._logger.info("Listing members", { orgId, managerId });

      const users = (await this._userRepo.findByOrg?.(orgId)) || [];
      const filtered = users.filter((u) => u.id !== managerId);
      const memberDTOs = filtered.map((user) => toUserDTO(user));

      this.sendSuccess(res, memberDTOs, COMMON_MESSAGES.MEMBERS_RETRIEVED);
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

      this.sendSuccess(res, org, "Organization details retrieved");
    },
  );
}
