import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IResetPasswordUseCase } from "../../domain/interfaces/useCases/IResetPasswordUseCase";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
import { IEmailService } from "../../domain/interfaces/services/IEmailService";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  private readonly _userRepo: IUserRepo;
  private readonly _hashService: IHashService;
  private readonly _jwtService: IJwtService;
  private readonly _emailService: IEmailService;
  private readonly _logger: ILogger;

  constructor(
    @inject(TYPES.IUserRepo) userRepo: IUserRepo,
    @inject(TYPES.IHashService) hashService: IHashService,
    @inject(TYPES.IJwtService) jwtService: IJwtService,
    @inject(TYPES.IEmailService) emailService: IEmailService,
    @inject(TYPES.ILogger) logger: ILogger,
  ) {
    this._userRepo = userRepo;
    this._hashService = hashService;
    this._jwtService = jwtService;
    this._emailService = emailService;
    this._logger = logger;
  }

  /**
   * ✅ ADDED: Request password reset (send email with reset link)
   */
  public async requestReset(
    email: string,
  ): Promise<{ message: string; token?: string }> {
    this._logger.info("Processing password reset request", { email });

    try {
      // Business Rule: Find user by email
      const user = await this._userRepo.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists - security best practice
        return { message: "If the email exists, a reset link has been sent" };
      }

      // Business Rule: Generate reset token
      const resetToken = this._jwtService.generateResetToken({
        id: user.id,
        email: user.email,
        type: "password_reset",
      });

      // Business Rule: Set token expiry (1 hour)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Store reset token in database
      await this._userRepo.setResetPasswordToken(email, resetToken, expiresAt);

      // ✅ FIXED: Use sendResetPasswordEmail instead of sendPasswordResetEmail
      await this._emailService.sendResetPasswordEmail(email, resetToken);

      this._logger.info("Password reset email sent", {
        email,
        userId: user.id,
      });

      return {
        message: "Password reset email sent successfully",
        token: resetToken, // Only in development - remove in production
      };
    } catch (error) {
      this._logger.error("Password reset request failed", error as Error, {
        email,
      });
      throw new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to process password reset request",
      );
    }
  }

  /**
   * ✅ ADDED: Reset password using token
   */
  public async resetWithToken(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    this._logger.info("Processing password reset with token");

    try {
      // Business Rule: Verify reset token
      const payload = this._jwtService.verifyResetToken(token);
      if (!payload) {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          "Invalid or expired reset token",
        );
      }

      // Business Rule: Find user by reset token
      const user = await this._userRepo.findByResetToken(token);
      if (!user) {
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          "Invalid or expired reset token",
        );
      }

      // Business Rule: Validate new password
      this._validatePassword(newPassword);

      // Business Rule: Hash new password
      const hashedPassword = await this._hashService.hash(newPassword);

      // Update password and clear reset token
      await this._userRepo.updatePassword(user.id, hashedPassword);

      this._logger.info("Password reset successful", { userId: user.id });

      return { message: "Password reset successfully" };
    } catch (error) {
      this._logger.error("Password reset with token failed", error as Error);
      throw error;
    }
  }

  /**
   * ✅ ADDED: Complete password reset process
   */
  public async completeReset(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    // This is an alias to resetWithToken for backward compatibility
    return this.resetWithToken(token, password);
  }

  /**
   * ✅ ADDED: Validate reset token
   */
  public async validateResetToken(token: string): Promise<boolean> {
    try {
      // Verify token signature and expiry
      const payload = this._jwtService.verifyResetToken(token);
      if (!payload) {
        return false;
      }

      // Check if token exists in database
      const user = await this._userRepo.findByResetToken(token);
      return !!user;
    } catch (error) {
      this._logger.error("Reset token validation failed", error as Error);
      return false;
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   */
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

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      );
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Password must contain at least one special character",
      );
    }
  }
}
