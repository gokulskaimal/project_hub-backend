import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IResetPasswordUseCase } from "../interface/useCases/IResetPasswordUseCase";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IHashService } from "../../application/interface/services/IHashService";
import { IJwtService } from "../../application/interface/services/IJwtService";
import { IEmailService } from "../../application/interface/services/IEmailService";
import { ILogger } from "../../application/interface/services/ILogger";
import { InvalidTokenError } from "../../domain/errors/AuthErrors";
import { IPasswordResetService } from "../../application/interface/services/IPasswordResetService";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.IEmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IPasswordResetService)
    private readonly _passwordResetService: IPasswordResetService,
    @inject(TYPES.IAuthValidationService)
    private readonly _authValidationService: IAuthValidationService,
  ) {}

  /**
   * Request password reset (send email with reset link)
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
      const hashedToken = await this._hashService.hashToken(resetToken);

      // Store reset token using dedicated service
      await this._passwordResetService.setResetToken(
        email,
        hashedToken,
        expiresAt,
      );

      // Use sendResetPasswordEmail instead of sendPasswordResetEmail
      await this._emailService.sendResetPasswordEmail(email, resetToken);

      this._logger.info("Password reset email sent", {
        email,
        userId: user.id,
      });

      return {
        message: "Password reset email sent successfully",
        token: hashedToken, // Only in development - remove in production
      };
    } catch (error) {
      this._logger.error("Password reset request failed", error as Error, {
        email,
      });
      throw error;
    }
  }

  /**
   * Reset password using token
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
        throw new InvalidTokenError("Invalid or expired reset token");
      }
      const hashedToken = await this._hashService.hashToken(token);
      // Business Rule: Find user by reset token using dedicated service
      const user = await this._passwordResetService.findByToken(hashedToken);
      if (!user) {
        throw new InvalidTokenError("Invalid or expired reset token");
      }

      // Business Rule: Validate new password
      this._authValidationService.validatePassword(newPassword);

      // Business Rule: Hash new password
      const hashedPassword = await this._hashService.hash(newPassword);

      // Update password and clear reset token using dedicated service
      await this._passwordResetService.updatePassword(user.id, hashedPassword);

      this._logger.info("Password reset successful", { userId: user.id });

      return { message: "Password reset successfully" };
    } catch (error) {
      this._logger.error("Password reset with token failed", error as Error);
      throw error;
    }
  }

  /**
   * Complete password reset process
   */
  public async completeReset(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    // This is an alias to resetWithToken for backward compatibility
    return this.resetWithToken(token, password);
  }

  /**
   * Validate reset token
   */
  public async validateResetToken(token: string): Promise<boolean> {
    try {
      // Verify token signature and expiry
      const payload = this._jwtService.verifyResetToken(token);
      if (!payload) {
        return false;
      }

      // Check if token exists using dedicated service
      const hashedToken = await this._hashService.hashToken(token);
      const user = await this._passwordResetService.findByToken(hashedToken);
      return !!user;
    } catch (error) {
      this._logger.error("Reset token validation failed", error as Error);
      return false;
    }
  }
}
