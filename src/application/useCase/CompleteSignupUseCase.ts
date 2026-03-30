import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { ICompleteSignupUseCase } from "../interface/useCases/ICompleteSignupUseCase";
import { IHashService } from "../../application/interface/services/IHashService";
import { IJwtService } from "../../application/interface/services/IJwtService";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ILogger } from "../../application/interface/services/ILogger";
import { User } from "../../domain/entities/User";
import {
  EntityNotFoundError,
  ConflictError,
} from "../../domain/errors/CommonErrors";
import { EmailNotVerifiedError } from "../../domain/errors/AuthErrors";
import { UserRole } from "../../domain/enums/UserRole";

@injectable()
export class CompleteSignupUseCase implements ICompleteSignupUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.IAuthValidationService)
    private readonly _authValidationService: IAuthValidationService,
  ) {}

  async validateSignupData(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean> {
    this._authValidationService.validateEmail(data.email);
    this._authValidationService.validatePassword(data.password);
    this._authValidationService.validateName(data.firstName, data.lastName);
    return true;
  }

  public async execute(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData: Record<string, unknown> = {},
  ): Promise<{
    user: Partial<User>;
    tokens: { accessToken: string; refreshToken: string; expiresIn: number };
  }> {
    this._logger.info("Completing user signup", { email, firstName, lastName });
    try {
      await this.validateSignupData({ email, password, firstName, lastName });

      const user = await this._userRepo.findByEmail(email);
      if (!user) {
        this._logger.warn("User not found for signup completion", { email });
        throw new EntityNotFoundError("User", email);
      }

      if (!user.emailVerified) {
        this._logger.warn("Email not verified for signup completion", {
          email,
        });
        throw new EmailNotVerifiedError();
      }

      if (user.name && user.password) {
        this._logger.warn("Signup already completed", { email });
        throw new ConflictError("Signup has already been completed");
      }

      const hashedPassword = await this._hashService.hash(password);
      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const updatedUser = await this._userRepo.updateProfile(user.id, {
        name: fullName,
        password: hashedPassword,
        status: "ACTIVE",
        ...additionalData,
      });

      this._logger.info("Signup completed successfully", {
        userId: user.id,
        email,
        firstName,
        lastName,
      });

      const safeUserData = {
        ...(updatedUser as unknown as Record<string, unknown>),
      } as Record<string, unknown>;
      Reflect.deleteProperty(safeUserData, "password");
      Reflect.deleteProperty(safeUserData, "resetPasswordToken");
      Reflect.deleteProperty(safeUserData, "resetPasswordExpires");
      Reflect.deleteProperty(safeUserData, "otp");
      Reflect.deleteProperty(safeUserData, "otpExpiry");

      const accessToken = this._jwtService.generateAccessToken({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role.replace(/\s+/g, "_") as UserRole,
        orgId: updatedUser.orgId,
      });
      const refreshToken = this._jwtService.generateRefreshToken({
        id: updatedUser.id,
        email: updatedUser.email,
      });

      return {
        user: safeUserData,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600,
        },
      };
    } catch (error) {
      this._logger.error("Failed to complete signup", error as Error, {
        email,
        firstName,
        lastName,
      });
      throw error;
    }
  }
}
