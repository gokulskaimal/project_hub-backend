/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { ICompleteSignupUseCase } from "../../domain/interfaces/useCases/ICompleteSignupUseCase";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
import { ILogger } from "../../domain/interfaces/services/ILogger";

@injectable()
export class CompleteSignupUseCase implements ICompleteSignupUseCase {
  private readonly _userRepo: IUserRepo;
  private readonly _logger: ILogger;
  private readonly _hashService: IHashService;
  private readonly _jwtService: IJwtService;

  constructor(
    @inject(TYPES.IUserRepo) userRepo: IUserRepo,
    @inject(TYPES.ILogger) logger: ILogger,
    @inject(TYPES.IHashService) hashService: IHashService,
    @inject(TYPES.IJwtService) jwtService: IJwtService,
  ) {
    this._userRepo = userRepo;
    this._logger = logger;
    this._hashService = hashService;
    this._jwtService = jwtService;
  }
  async validateSignupData(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean> {
    const { email, password, firstName, lastName } = data;

    if (!email || typeof email !== "string") {
      throw new Error("Email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    if (
      !firstName ||
      typeof firstName !== "string" ||
      firstName.trim().length < 2
    ) {
      throw new Error("First name must be at least 2 characters long");
    }
    if (firstName.trim().length > 100) {
      throw new Error("First name must be less than 100 characters long");
    }

    if (
      !lastName ||
      typeof lastName !== "string" ||
      lastName.trim().length < 2
    ) {
      throw new Error("Last name must be at least 2 characters long");
    }
    if (lastName.trim().length > 100) {
      throw new Error("Last name must be less than 100 characters long");
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
    additionalData: Record<string, any> = {},
  ): Promise<{
    user: any;
    tokens: { accessToken: string; refreshToken: string; expiresIn: number };
  }> {
    this._logger.info("Completing user signup", { email, firstName, lastName });
    try {
      await this.validateSignupData({ email, password, firstName, lastName });

      const user = await this._userRepo.findByEmail(email);
      if (!user) {
        this._logger.warn("User not found for signup completion", { email });
        throw new Error("User not found");
      }

      if (!user.emailVerified) {
        this._logger.warn("Email not verified for signup completion", {
          email,
        });
        throw new Error("Email must be verified before completing signup");
      }

      if (user.name && user.password) {
        this._logger.warn("Signup already completed", { email });
        throw new Error("Signup has already been completed");
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

      const {
        password: _,
        resetPasswordToken,
        resetPasswordExpires,
        otp,
        otpExpiry,
        ...safeUserData
      } = updatedUser;

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
      throw new Error("Password is required");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    if (password.length > 128) {
      throw new Error("Password must be less than 128 characters long");
    }
    if (!/[a-z]/.test(password)) {
      throw new Error("Password must contain at least one lowercase letter");
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error("Password must contain at least one uppercase letter");
    }
    if (!/\d/.test(password)) {
      throw new Error("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error("Password must contain at least one special character");
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
      throw new Error(
        "Password is too common. Please choose a stronger password",
      );
    }
  }
}
