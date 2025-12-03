import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IInviteRepo } from "../../infrastructure/interface/repositories/IInviteRepo";
import { IEmailService } from "../../infrastructure/interface/services/IEmailService";
import { IInviteMemberUseCase } from "../interface/useCases/IInviteMemberUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class InviteMemberUseCase implements IInviteMemberUseCase {
  constructor(
    @inject(TYPES.IInviteRepo) private readonly _inviteRepo: IInviteRepo,
    @inject(TYPES.IEmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
  ) {}

  public async execute(
    email: string,
    orgId: string,
    role?: string,
  ): Promise<{
    invitationId: string;
    token: string;
    expiresAt: Date;
    message: string;
  }> {
    this._logger.info("Processing member invitation", { email, orgId, role });

    try {
      this._validateInput(email, orgId);

      const organization = await this._orgRepo.findById(orgId);
      if (!organization) {
        this._logger.warn("Organization not found for invitation", { orgId });
        throw new HttpError(StatusCodes.NOT_FOUND, "Organization not found");
      }

      const existingUser = await this._userRepo.findByEmail(email);
      if (existingUser) {
        this._logger.warn("User already exists", { email });
        throw new HttpError(
          StatusCodes.CONFLICT,
          "User with this email already exists",
        );
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
        throw new HttpError(
          StatusCodes.CONFLICT,
          "An invitation to this email is already pending",
        );
      }

      const token = this._generateInvitationToken();
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Use const assertion for status
      const inviteData = {
        email,
        orgId,
        token,
        status: "PENDING" as const,
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
    role?: string,
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
        const result = await this.execute(email, orgId, role);

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

  private _validateInput(email: string, orgId: string): void {
    if (!email || typeof email !== "string") {
      throw new HttpError(StatusCodes.BAD_REQUEST, "Email is required");
    }

    if (!orgId || typeof orgId !== "string") {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Organization ID is required",
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid email format");
    }

    if (email.length > 254) {
      throw new HttpError(StatusCodes.BAD_REQUEST, "Email address is too long");
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
  ): Promise<void> {
    try {
      await this._emailService.sendInviteEmail(
        email,
        token,
        orgName,
        "Organization Manager",
      );

      this._logger.info("Invitation email sent", { email, orgName });
    } catch (error) {
      this._logger.error("Failed to send invitation email", error as Error, {
        email,
        orgName,
      });
      throw new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to send invitation email",
      );
    }
  }
}
