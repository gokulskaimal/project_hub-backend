import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { UserRole } from "../../domain/enums/UserRole";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { IInviteRepo } from "../../infrastructure/interface/repositories/IInviteRepo";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IAcceptUseCase } from "../interface/useCases/IAcceptUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { toUserDTO, UserDTO } from "../../application/dto/UserDTO";
import { toInviteDTO, InviteDTO } from "../../application/dto/InviteDTO";
import { IAuthValidationService } from "../../infrastructure/interface/services/IAuthValidationService";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { NotificationType } from "../../domain/enums/NotificationType";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import {
  ConflictError,
  EntityNotFoundError,
  ValidationError,
} from "../../domain/errors/CommonErrors";

@injectable()
export class AcceptUseCase implements IAcceptUseCase {
  constructor(
    @inject(TYPES.IInviteRepo) private readonly _inviteRepo: IInviteRepo,
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.IAuthValidationService)
    private readonly _authValidationService: IAuthValidationService,
    @inject(TYPES.ICreateNotificationUseCase)
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
    @inject(TYPES.ISocketService)
    private readonly _socketService: ISocketService,
  ) {}

  /**
   * @param token - Invitation token
   * @param password - User's chosen password
   * @param firstName - User's first name
   * @param lastName - User's last name
   * @param additionalData - Optional additional data
   * @returns User, organization, and tokens
   */
  public async execute(
    token: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData?: Record<string, unknown>,
  ): Promise<{
    user: UserDTO;
    organization: { id: string; name: string; status: OrganizationStatus };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }> {
    this._logger.info("Processing invitation acceptance", {
      token: token.substring(0, 8) + "...",
      firstName,
      lastName,
    });

    try {
      // Business Rule: Validate input
      if (!token || !password || !firstName || !lastName) {
        throw new ValidationError(
          "Token, password, first name, and last name are required",
        );
      }
      this._authValidationService.validatePassword(password);
      this._authValidationService.validateName(firstName, lastName);

      // Business Rule: Find and validate invitation
      const hashedToken = this._hashService.hashToken(token);
      const invite = await this._inviteRepo.findByToken(hashedToken);
      if (!invite) {
        this._logger.warn("Invitation not found", {
          token: token.substring(0, 8) + "...",
        });
        throw new ValidationError("Invalid invitation token");
      }

      // Business Rule: Check invitation status and expiry
      if (invite.expiry < new Date()) {
        this._logger.warn("Invitation expired", {
          token: token.substring(0, 8) + "...",
          expiry: invite.expiry,
        });
        throw new ValidationError("Invitation has expired");
      }

      if (invite.status !== "PENDING") {
        this._logger.warn("Invitation not available", {
          token: token.substring(0, 8) + "...",
          status: invite.status,
        });

        if (invite.status === "CANCELLED") {
          throw new ValidationError(
            "This invitation has been cancelled by your organization administrator",
          );
        } else if (invite.status === "ACCEPTED") {
          throw new ValidationError(
            "This invitation has already been used to create an account",
          );
        } else if (invite.status === "EXPIRED") {
          throw new ValidationError(
            "This invitation has expired. Please request a new invitation",
          );
        } else {
          throw new ValidationError(
            `Invitation is not available (status: ${invite.status})`,
          );
        }
      }

      // Business Rule: Check if user already exists
      const existingUser = await this._userRepo.findByEmail(invite.email);
      if (existingUser) {
        this._logger.warn("User already exists for invitation", {
          email: invite.email,
        });
        throw new ConflictError("User already exists with this email");
      }

      // Business Rule: Get organization details
      const organization = await this._userRepo.findOrganizationById?.(
        invite.orgId,
      );
      if (!organization) {
        throw new EntityNotFoundError("Organization Not Found", invite.orgId);
      }

      // Business Rule: Validate password (now handled above)

      // Business Rule: Hash password
      const hashedPassword = await this._hashService.hash(password);

      // Create user with invitation details
      const newUser = await this._userRepo.create({
        email: invite.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        orgId: invite.orgId,
        role: (invite.assignedRole as UserRole) || UserRole.TEAM_MEMBER,
        password: hashedPassword,
        emailVerified: true,
        status: "ACTIVE",
        createdAt: new Date(),
        ...(additionalData as Record<string, unknown>),
      });

      // Generate authentication tokens
      const accessToken = this._jwtService.generateAccessToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        orgId: newUser.orgId,
      });

      const refreshToken = this._jwtService.generateRefreshToken({
        id: newUser.id,
        email: newUser.email,
      });

      // Mark invitation as accepted
      await this._inviteRepo.markAccepted(hashedToken);

      this._logger.info("Invitation accepted successfully", {
        userId: newUser.id,
        email: invite.email,
        orgId: invite.orgId,
        firstName,
        lastName,
      });

      // [NEW] Notify Org Managers about new member
      this._notifyManagers(newUser.orgId!, newUser.name!).catch((err) =>
        this._logger.error("Failed to notify managers about new joiner", err),
      );

      return {
        user: toUserDTO(newUser),
        organization: {
          id: organization.id,
          name: organization.name,
          status: organization.status,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 15 * 60, // 15 minutes
        },
      };
    } catch (error) {
      this._logger.error("Failed to accept invitation", error as Error, {
        token: token.substring(0, 8) + "...",
        firstName,
        lastName,
      });
      throw error;
    }
  }

  /**
   * @param token - Invitation token
   * @returns Validation result
   */
  public async validateInvitationToken(token: string): Promise<{
    valid: boolean;
    invitation?: InviteDTO;
    expired?: boolean;
    cancelled?: boolean;
    accepted?: boolean;
  }> {
    try {
      if (!token) {
        return { valid: false };
      }

      const hashedToken = this._hashService.hashToken(token);
      const invite = await this._inviteRepo.findByToken(hashedToken);
      if (!invite) {
        return { valid: false };
      }

      const expired = invite.expiry < new Date();
      const cancelled = invite.status === "CANCELLED";
      const accepted = invite.status === "ACCEPTED";
      const processed = invite.status !== "PENDING";

      return {
        valid: !expired && !processed,
        invitation: toInviteDTO(invite),
        expired,
        cancelled,
        accepted,
      };
    } catch (error) {
      this._logger.error("Token validation failed", error as Error);
      return { valid: false };
    }
  }

  private async _notifyManagers(orgId: string, memberName: string) {
    try {
      const managers = await this._userRepo.findByOrgAndRole(
        orgId,
        UserRole.ORG_MANAGER,
      );

      for (const manager of managers) {
        // 1. Persistent Notification
        await this._createNotificationUseCase.execute(
          manager.id,
          "New Member Joined",
          `${memberName} has joined your organization.`,
          NotificationType.SUCCESS,
          "/manager/members",
        );
      }

      // 2. Real-time Role Broadcast (Org Manager)
      this._socketService.emitToRoleInOrg(
        orgId,
        UserRole.ORG_MANAGER,
        "member:joined",
        { memberName, joinedAt: new Date() },
      );

      // 3. [NEW] Real-time Role Broadcast (Super Admin)
      this._socketService.emitToRole(
        UserRole.SUPER_ADMIN,
        "platform:member_joined",
        { organizationId: orgId, memberName },
      );
    } catch (error) {
      this._logger.error("Member join notification error:", error as Error);
    }
  }
}
