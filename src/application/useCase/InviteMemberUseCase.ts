import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IInviteRepo } from "../../application/interface/repositories/IInviteRepo";
import { IEmailService } from "../../application/interface/services/IEmailService";
import { IHashService } from "../../application/interface/services/IHashService";
import { IInviteMemberUseCase } from "../interface/useCases/IInviteMemberUseCase";
import { ILogger } from "../../application/interface/services/ILogger";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { ISubscriptionRepo } from "../../application/interface/repositories/ISubscriptionRepo";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ISecurityService } from "../../application/interface/services/ISecurityService";
import { QuotaExceededError } from "../../domain/errors/CommonErrors";
import {
  ConflictError,
  ValidationError,
} from "../../domain/errors/CommonErrors";
import { UserRole } from "../../domain/enums/UserRole";
import { AppConfig } from "../../config/AppConfig";
import { OrganizationNotFoundError } from "../../domain/errors/AuthErrors";

@injectable()
export class InviteMemberUseCase implements IInviteMemberUseCase {
  constructor(
    @inject(TYPES.IInviteRepo) private readonly _inviteRepo: IInviteRepo,
    @inject(TYPES.IEmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ISubscriptionRepo)
    private readonly _subRepo: ISubscriptionRepo,
    @inject(TYPES.IPlanRepo) private readonly _planRepo: IPlanRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IAuthValidationService)
    private readonly _authValidationService: IAuthValidationService,
    @inject(TYPES.ISecurityService)
    private readonly _securityService: ISecurityService,
    @inject(TYPES.AppConfig) private readonly config: AppConfig,
  ) {}

  public async execute(
    email: string,
    orgId: string,
    requesterId: string,
    role?: string,
    expiresIn: number = this.config.invite.expiryDays,
  ): Promise<{
    invitationId: string;
    token: string;
    expiresAt: Date;
    message: string;
  }> {
    this._logger.info("Processing member invitation", { email, orgId, role });

    try {
      this._validateOrgId(orgId);
      // RBAC Check
      await this._securityService.validateOrgManager(requesterId, orgId);

      this._authValidationService.validateEmail(email);

      const organization = await this._orgRepo.findById(orgId);
      if (!organization) {
        this._logger.warn("Organization not found for invitation", { orgId });
        throw new OrganizationNotFoundError();
      }

      // Check Plan Limits
      if (organization.createdBy) {
        let limit = 5;
        const subscription = await this._subRepo.findByUserId(
          organization.createdBy,
        );

        if (!subscription || subscription.status !== "active") {
          this._logger.warn(
            `No active subscription found for org ${orgId}. Using Free Plan limits.`,
          );
          const freePlans = await this._planRepo.findAll({ isActive: true });
          const freePlan = freePlans.find((p) => p.price === 0);

          if (freePlan && freePlan.limits) {
            limit = freePlan.limits.members ?? 5;
          }
        } else {
          const plan = await this._planRepo.findById(subscription.planId);
          if (plan && plan.limits && plan.limits.members !== -1) {
            limit = plan.limits.members;
          } else {
            limit = -1;
          }
        }

        if (limit !== -1) {
          const currentMembers = await this._userRepo.countByOrg(orgId);
          if (currentMembers >= limit) {
            throw new QuotaExceededError(
              `Member capacity limit of ${limit} reached. Please upgrade your plan.`,
            );
          }
        }
      }

      const existingUser = await this._userRepo.findByEmail(email);
      if (existingUser) {
        this._logger.warn("User already exists", { email });
        throw new ConflictError("User with this email already exists");
      }

      const existingInvite = await this._inviteRepo.findPendingByEmail(
        email,
        orgId,
      );
      if (existingInvite) {
        this._logger.warn("Pending invitation already exists", {
          email,
          orgId,
        });
        throw new ConflictError(
          "An invitation to this email is already pending",
        );
      }

      const token = this._generateInvitationToken();
      const hashedToken = await this._hashService.hashToken(token);

      const expiry = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);

      // Use const assertion for status
      const inviteData = {
        email,
        orgId,
        token: hashedToken,
        status: "PENDING" as const,
        expiry,
        role: role || UserRole.TEAM_MEMBER,
        createdAt: new Date(),
      };

      const invitation = await this._inviteRepo.create(inviteData);

      const requester = await this._userRepo.findById(requesterId);
      const inviterName = requester
        ? `${requester.firstName || ""} ${requester.lastName || ""}`.trim() ||
          requester.name ||
          "A Manager"
        : "A Manager";

      await this._sendInvitationEmail(
        email,
        token,
        organization.name,
        inviterName,
      );

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
    } catch (error) {
      this._logger.error("Failed to send member invitation", error as Error, {
        email,
        orgId,
      });
      throw error;
    }
  }

  public async bulkInvite(
    emails: string[],
    orgId: string,
    requesterId: string,
    role?: string,
    expiresIn: number = this.config.invite.expiryDays,
  ): Promise<{
    successful: Array<{ email: string; invitationId: string }>;
    failed: Array<{ email: string; error: string }>;
    summary: { total: number; successful: number; failed: number };
  }> {
    this._logger.info("Processing bulk member invitations", {
      emailCount: emails.length,
      orgId,
      role,
    });

    const successful: Array<{ email: string; invitationId: string }> = [];
    const failed: Array<{ email: string; error: string }> = [];

    for (const email of emails) {
      try {
        const result = await this.execute(
          email,
          orgId,
          requesterId,
          role,
          expiresIn,
        );

        successful.push({
          email,
          invitationId: result.invitationId,
        });

        this._logger.info("Bulk invitation successful for email", { email });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

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

  private _validateOrgId(orgId: string): void {
    if (!orgId || typeof orgId !== "string") {
      throw new ValidationError("Organization ID is required");
    }
  }

  private _generateInvitationToken(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";

    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return token;
  }

  private async _sendInvitationEmail(
    email: string,
    token: string,
    orgName: string,
    inviterName: string,
  ): Promise<void> {
    try {
      await this._emailService.sendInviteEmail(
        email,
        token,
        orgName,
        inviterName,
      );

      this._logger.info("Invitation email sent", { email, orgName });
    } catch (error) {
      this._logger.error("Failed to send invitation email", error as Error, {
        email,
        orgName,
      });
      // Throw standard Error for internal failures, middleware will handle as 500
      throw new Error("Failed to send invitation email");
    }
  }
}
