import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { ICompleteSignupUseCase } from "../interface/useCases/ICompleteSignupUseCase";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";
import { User } from "../../domain/entities/User";

@injectable()
export class CompleteSignupUseCase implements ICompleteSignupUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
  ) {}
  async validateSignupData(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean> {
    const { email, password, firstName, lastName } = data;

    if (!email || typeof email !== "string") {
      throw new HttpError(StatusCodes.BAD_REQUEST, "Email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid email format");
    }

    if (
      !firstName ||
      typeof firstName !== "string" ||
      firstName.trim().length < 2
    ) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "First name must be at least 2 characters long",
      );
    }
    if (firstName.trim().length > 100) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "First name must be less than 100 characters long",
      );
    }

    if (
      !lastName ||
      typeof lastName !== "string" ||
      lastName.trim().length < 2
    ) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Last name must be at least 2 characters long",
      );
    }
    if (lastName.trim().length > 100) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Last name must be less than 100 characters long",
      );
    }

    // Validate password strength using existing helper
    this._validatePassword(password);

    return true;
  }

  /**
   * Complete user signup process
   * @param email - User email
   * @param name - User full name
   * @param password - User password
   * @returns Updated user data
   */
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
        throw new HttpError(StatusCodes.NOT_FOUND, "User not found");
      }

      if (!user.emailVerified) {
        this._logger.warn("Email not verified for signup completion", {
          email,
        });
        throw new HttpError(
          StatusCodes.FORBIDDEN,
          "Email must be verified before completing signup",
        );
      }

      if (user.name && user.password) {
        this._logger.warn("Signup already completed", { email });
        throw new HttpError(
          StatusCodes.CONFLICT,
          "Signup has already been completed",
        );
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
        role: updatedUser.role,
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
  private _validatePassword(password: string): void {
    if (!password || typeof password !== "string") {
      throw new HttpError(StatusCodes.BAD_REQUEST, "Password is required");
    }
    if (password.length < 8) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must be at least 8 characters long",
      );
    }
    if (password.length > 128) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must be less than 128 characters long",
      );
    }
    if (!/[a-z]/.test(password)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must contain at least one lowercase letter",
      );
    }
    if (!/[A-Z]/.test(password)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must contain at least one uppercase letter",
      );
    }
    if (!/\d/.test(password)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must contain at least one number",
      );
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must contain at least one special character",
      );
    }
    const weakPasswords = [
      "password",
      "12345678",
      "qwerty",
      "abc123",
      "password1",
      "admin123",
      "welcome1",
    ];
    if (weakPasswords.includes(password.toLowerCase())) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password is too common. Please choose a stronger password",
      );
    }
  }
}
