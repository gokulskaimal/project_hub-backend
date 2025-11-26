import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { UserRole } from "../../domain/enums/UserRole";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IAcceptUseCase } from "../../domain/interfaces/useCases/IAcceptUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";

@injectable()
export class AcceptUseCase implements IAcceptUseCase {
  private readonly _inviteRepo: IInviteRepo;
  private readonly _userRepo: IUserRepo;
  private readonly _logger: ILogger;
  private readonly _hashService: IHashService;
  private readonly _jwtService: IJwtService;

  constructor(
    @inject(TYPES.IInviteRepo) inviteRepo: IInviteRepo,
    @inject(TYPES.IUserRepo) userRepo: IUserRepo,
    @inject(TYPES.ILogger) logger: ILogger,
    @inject(TYPES.IHashService) hashService: IHashService,
    @inject(TYPES.IJwtService) jwtService: IJwtService,
  ) {
    this._inviteRepo = inviteRepo;
    this._userRepo = userRepo;
    this._logger = logger;
    this._hashService = hashService;
    this._jwtService = jwtService;
  }

  /**
   * ✅ FIXED: Execute invitation acceptance with correct signature
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
    user: Record<string, unknown>;
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
        throw new Error(
          "Token, password, first name, and last name are required",
        );
      }

      // Business Rule: Find and validate invitation
      const invite = await this._inviteRepo.findByToken(token);
      if (!invite) {
        this._logger.warn("Invitation not found", {
          token: token.substring(0, 8) + "...",
        });
        throw new Error("Invalid invitation token");
      }

      // Business Rule: Check invitation status and expiry
      if (invite.expiry < new Date()) {
        this._logger.warn("Invitation expired", {
          token: token.substring(0, 8) + "...",
          expiry: invite.expiry,
        });
        throw new Error("Invitation has expired");
      }

      if (invite.status !== "PENDING") {
        this._logger.warn("Invitation not available", {
          token: token.substring(0, 8) + "...",
          status: invite.status,
        });

        if (invite.status === "CANCELLED") {
          throw new Error(
            "This invitation has been cancelled by your organization administrator",
          );
        } else if (invite.status === "ACCEPTED") {
          throw new Error(
            "This invitation has already been used to create an account",
          );
        } else if (invite.status === "EXPIRED") {
          throw new Error(
            "This invitation has expired. Please request a new invitation",
          );
        } else {
          throw new Error(
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
        throw new Error("User already exists with this email");
      }

      // Business Rule: Get organization details
      const organization = await this._userRepo.findOrganizationById?.(
        invite.orgId,
      );
      if (!organization) {
        throw new Error("Organization not found");
      }

      // Business Rule: Validate password
      this._validatePassword(password);

      // Business Rule: Hash password
      const hashedPassword = await this._hashService.hash(password);

      // Create user with invitation details
      const newUser = await this._userRepo.create({
        email: invite.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        orgId: invite.orgId,
        role: UserRole.TEAM_MEMBER,
        password: hashedPassword,
        emailVerified: true, // Pre-verified through invitation
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
      await this._inviteRepo.markAccepted(token);

      this._logger.info("Invitation accepted successfully", {
        userId: newUser.id,
        email: invite.email,
        orgId: invite.orgId,
        firstName,
        lastName,
      });

      // Return safe user data (exclude sensitive fields)
      const safeUserData = {
        ...(newUser as unknown as Record<string, unknown>),
      } as Record<string, unknown>;
      Reflect.deleteProperty(safeUserData, "password");
      Reflect.deleteProperty(safeUserData, "resetPasswordToken");
      Reflect.deleteProperty(safeUserData, "resetPasswordExpires");
      Reflect.deleteProperty(safeUserData, "otp");
      Reflect.deleteProperty(safeUserData, "otpExpiry");

      return {
        user: safeUserData,
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
    invitation?: Record<string, unknown>;
    expired?: boolean;
    cancelled?: boolean;
    accepted?: boolean;
  }> {
    try {
      if (!token) {
        return { valid: false };
      }

      const invite = await this._inviteRepo.findByToken(token);
      if (!invite) {
        return { valid: false };
      }

      const expired = invite.expiry < new Date();
      const cancelled = invite.status === "CANCELLED";
      const accepted = invite.status === "ACCEPTED";
      const processed = invite.status !== "PENDING";

      return {
        valid: !expired && !processed,
        invitation: {
          email: invite.email,
          orgId: invite.orgId,
          createdAt: invite.createdAt,
          expiry: invite.expiry,
          status: invite.status,
        } as Record<string, unknown>,
        expired,
        cancelled,
        accepted,
      };
    } catch (error) {
      this._logger.error("Token validation failed", error as Error);
      return { valid: false };
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   */
  private _validatePassword(password: string): void {
    if (!password || typeof password !== "string") {
      throw new Error("Password is required");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error(
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error("Password must contain at least one special character");
    }
  }
}
