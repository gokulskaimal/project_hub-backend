import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { UserRole } from "../../domain/enums/UserRole";
import { ICreateNotificationUseCase } from "../interface/useCases/ICreateNotificationUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { ISocketService } from "../../infrastructure/interface/services/ISocketService";
import { IOtpService } from "../../infrastructure/interface/services/IOtpService";
import { IEmailService } from "../../infrastructure/interface/services/IEmailService";
import { IRegisterManagerUseCase } from "../interface/useCases/IRegisterManagerUseCase";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { IAuthValidationService } from "../../infrastructure/interface/services/IAuthValidationService";
import { ConflictError } from "../../domain/errors/CommonErrors";

@injectable()
export class RegisterManagerUseCase implements IRegisterManagerUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ISocketService)
    private readonly _socketService: ISocketService,
    @inject(TYPES.IOtpService) private readonly _otpService: IOtpService,
    @inject(TYPES.IEmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IAuthValidationService)
    private readonly _authValidationService: IAuthValidationService,
    @inject(TYPES.ICreateNotificationUseCase)
    private readonly _createNotificationUseCase: ICreateNotificationUseCase,
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
      this._authValidationService.validateEmail(email);
      this._authValidationService.validateOrgName(organizationName);

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

      //const assertion for organization status
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

      const superAdmins = await this._userRepo.findByRole(UserRole.SUPER_ADMIN);
      for (const admin of superAdmins) {
        await this._createNotificationUseCase.execute(
          admin.id,
          "New Organization Registered",
          `A new Organization ${organizationName} has been registered by ${email}`,
          "INFO",
          organization.id,
        );
      }
      this._socketService.emitToRole(UserRole.SUPER_ADMIN, "org:registered", {
        organizationName,
        email,
        organizationId: organization.id,
      });

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

      this._authValidationService.validateOrgName(trimmedName);

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
