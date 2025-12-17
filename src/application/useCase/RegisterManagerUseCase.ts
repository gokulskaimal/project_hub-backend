import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { UserRole } from "../../domain/enums/UserRole";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOtpService } from "../../infrastructure/interface/services/IOtpService";
import { IEmailService } from "../../infrastructure/interface/services/IEmailService";
import { IRegisterManagerUseCase } from "../interface/useCases/IRegisterManagerUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { OrganizationStatus } from "../../domain/entities/Organization";
import {
  ConflictError,
  ValidationError,
} from "../../domain/errors/CommonErrors";

@injectable()
export class RegisterManagerUseCase implements IRegisterManagerUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOtpService) private readonly _otpService: IOtpService,
    @inject(TYPES.IEmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
  ) {}

  public async execute(
    email: string,
    organizationName: string,
  ): Promise<{
    message: string;
    organizationId: string;
    invitationToken: string;
    otpExpiresAt: Date;
  }> {
    this._logger.info("Manager registration attempt", {
      email,
      organizationName,
    });

    try {
      this._validateInput(email, organizationName);

      const isNameAvailable =
        await this.validateOrganizationName(organizationName);
      if (!isNameAvailable) {
        throw new ConflictError("Organization name is already taken");
      }

      const existingUser = await this._userRepo.findByEmail(email);
      if (existingUser && existingUser.emailVerified) {
        this._logger.warn("Manager already exists and verified", { email });
        throw new ConflictError("User already exists and is verified");
      }

      // ✅ FIXED: Use const assertion for organization status
      const organizationData = {
        name: organizationName.trim(),
        status: OrganizationStatus.ACTIVE, // Use const assertion
        createdAt: new Date(),
        settings: {
          allowInvitations: true,
          requireEmailVerification: true,
        },
      };

      const organization = await this._orgRepo.create(organizationData);

      const invitationToken = this._generateInvitationToken();

      const otp = this._otpService.generateOtp(6);
      const expiry = this._otpService.generateExpiry(1);

      const userData = {
        email,
        orgId: organization.id,
        role: UserRole.ORG_MANAGER,
        password: "",
        otp,
        otpExpiry: expiry,
        invitationToken,
        emailVerified: false,
        status: "PENDING_VERIFICATION" as const,
        createdAt: new Date(),
      };

      if (existingUser) {
        await this._userRepo.updateProfile(existingUser.id, userData);
      } else {
        await this._userRepo.create(userData);
      }

      await this._emailService.sendOtpEmail(
        email,
        otp,
        `${organizationName} manager registration`,
      );

      this._logger.info("Manager registration initiated successfully", {
        email,
        organizationName,
        organizationId: organization.id,
      });

      return {
        message: "Organization created and verification email sent",
        organizationId: organization.id,
        invitationToken,
        otpExpiresAt: expiry,
      };
    } catch (error) {
      this._logger.error("Manager registration failed", error as Error, {
        email,
        organizationName,
      });
      throw error;
    }
  }

  public async validateOrganizationName(name: string): Promise<boolean> {
    this._logger.info("Validating organization name availability", { name });

    try {
      if (!name || typeof name !== "string") {
        return false;
      }

      const trimmedName = name.trim();

      if (trimmedName.length < 2) {
        return false;
      }

      if (trimmedName.length > 100) {
        return false;
      }

      const validNameRegex = /^[a-zA-Z0-9\s\-_.&]+$/;
      if (!validNameRegex.test(trimmedName)) {
        return false;
      }

      const existingOrg = await this._orgRepo.findByName(trimmedName);
      const isAvailable = !existingOrg;

      this._logger.info("Organization name validation completed", {
        name: trimmedName,
        available: isAvailable,
      });

      return isAvailable;
    } catch (error) {
      this._logger.error(
        "Organization name validation failed",
        error as Error,
        { name },
      );
      return false;
    }
  }

  private _validateInput(email: string, organizationName: string): void {
    if (!email || typeof email !== "string") {
      throw new ValidationError("Email is required");
    }

    if (!organizationName || typeof organizationName !== "string") {
      throw new ValidationError("Organization name is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (email.length > 254) {
      throw new ValidationError("Email address is too long");
    }

    const trimmedName = organizationName.trim();
    if (trimmedName.length < 2) {
      throw new ValidationError(
        "Organization name must be at least 2 characters long",
      );
    }

    if (trimmedName.length > 100) {
      throw new ValidationError(
        "Organization name must be less than 100 characters",
      );
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
}

