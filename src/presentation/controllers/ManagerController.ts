import { Response } from "express";
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";
import { IInviteMemberUseCase } from "../../domain/interfaces/useCases/IInviteMemberUseCase";
import { AuthenticatedRequest } from "../middleware/types/AuthenticatedRequest";
import { toUserDTO } from "../../application/dto/UserDTO";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { COMMON_MESSAGES } from "../../infrastructure/config/common.constants";

/**
 * Manager Controller
 *
 * Handles operations specific to organization managers including member management
 * and invitation handling within their organization
 */
@injectable()
export class ManagerController {
  private readonly _logger: ILogger;
  private readonly _userRepo: IUserRepo;
  private readonly _inviteRepo: IInviteRepo;
  private readonly _inviteMemberUC: IInviteMemberUseCase;

  /**
   * Creates a new ManagerController instance with dependency injection
   *
   * @param logger - Logging service
   * @param userRepo - User repository for member management
   * @param inviteRepo - Invitation repository for invitation management
   * @param inviteMemberUC - Use case for inviting members
   */
  constructor(
    @inject(TYPES.ILogger) logger: ILogger,
    @inject(TYPES.IUserRepo) userRepo: IUserRepo,
    @inject(TYPES.IInviteRepo) inviteRepo: IInviteRepo,
    @inject(TYPES.IInviteMemberUseCase) inviteMemberUC: IInviteMemberUseCase,
  ) {
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
  public async inviteMember(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { email } = req.body;
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;

      if (!email) {
        res.status(StatusCodes.BAD_REQUEST).json({
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

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.INVITATION_SENT,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to invite member";

      this._logger.error("Failed to invite member", err as Error, {
        managerId: req.user?.id,
        inviteEmail: req.body.email,
        orgId: req.user?.orgId,
        ip: req.ip,
      });

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  public async bulkInvite(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { emails } = req.body;
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        res.status(StatusCodes.BAD_REQUEST).json({
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
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push({ email, status: "error", error: errorMessage });
        }
      }

      res.status(StatusCodes.OK).json({
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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to bulk invite members";

      this._logger.error("Failed to bulk invite members", err as Error, {
        managerId: req.user?.id,
        orgId: req.user?.orgId,
        ip: req.ip,
      });

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  public async listInvitations(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;

      this._logger.info("Manager listing invitations", {
        managerId,
        orgId,
        ip: req.ip,
      });

      const invitations =
        (await this._inviteRepo.findByOrganization?.(orgId)) || [];

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.INVITATIONS_RETRIEVED,
        data: invitations,
        count: invitations.length,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to retrieve invitations";

      this._logger.error("Failed to list invitations", err as Error, {
        managerId: req.user?.id,
        orgId: req.user?.orgId,
        ip: req.ip,
      });

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  public async cancelInvitation(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { token } = req.params;
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;

      if (!token) {
        res.status(StatusCodes.BAD_REQUEST).json({
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
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "Invitation not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify invitation belongs to same organization
      if (invitation.orgId !== orgId) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          error:
            "Access denied: Invitation does not belong to your organization",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Cancel the invitation
      await this._inviteRepo.markCancelled?.(token);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Invitation cancelled successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel invitation";

      this._logger.error("Failed to cancel invitation", err as Error, {
        managerId: req.user?.id,
        token: req.params.token,
        orgId: req.user?.orgId,
        ip: req.ip,
      });

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  public async listMembers(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;

      if (!orgId) {
        res.status(StatusCodes.BAD_REQUEST).json({
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
      const memberDTOs = filtered.map((user) => toUserDTO(user));

      res.status(StatusCodes.OK).json({
        success: true,
        message: COMMON_MESSAGES.MEMBERS_RETRIEVED,
        data: memberDTOs,
        count: memberDTOs.length,
        orgId,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to retrieve organization members";

      this._logger.error("Failed to list organization members", err as Error, {
        managerId: req.user?.id,
        orgId: req.user?.orgId,
        ip: req.ip,
      });

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  public async updateMemberStatus(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;

      if (!id || !status) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Member ID and status are required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Prevent manager from changing their own status
      if (id === managerId) {
        res.status(StatusCodes.BAD_REQUEST).json({
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
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "Member not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify member belongs to same organization
      if (member.orgId !== orgId) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          error: "Access denied: Member does not belong to your organization",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update member status through repository
      const updatedMember = await this._userRepo.updateStatus(id, status);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Member status updated successfully",
        data: toUserDTO(updatedMember),
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update member status";

      this._logger.error("Failed to update member status", err as Error, {
        managerId: req.user?.id,
        targetMemberId: req.params.id,
        orgId: req.user?.orgId,
        ip: req.ip,
      });

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  public async removeMember(
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const orgId = req.user!.orgId!;
      const managerId = req.user!.id;

      if (!id) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Member ID is required",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Prevent manager from removing themselves
      if (id === managerId) {
        res.status(StatusCodes.BAD_REQUEST).json({
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
        res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "Member not found",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Verify member belongs to same organization
      if (member.orgId !== orgId) {
        res.status(StatusCodes.FORBIDDEN).json({
          success: false,
          error: "Access denied: Member does not belong to your organization",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Remove member through repository
      await this._userRepo.removeFromOrg(id, orgId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Member removed from organization successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to remove member";

      this._logger.error("Failed to remove member", err as Error, {
        managerId: req.user?.id,
        targetMemberId: req.params.id,
        orgId: req.user?.orgId,
        ip: req.ip,
      });

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
