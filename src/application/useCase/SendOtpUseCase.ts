import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ISendOtpUseCase } from "../interface/useCases/ISendOtpUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOtpService } from "../../infrastructure/interface/services/IOtpService";
import { IEmailService } from "../../infrastructure/interface/services/IEmailService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ICacheService } from "../../infrastructure/interface/services/ICacheService";
import {
  ValidationError,
  TooManyRequestsError,
  InvalidOperationError,
} from "../../domain/errors/CommonErrors";

@injectable()
export class SendOtpUseCase implements ISendOtpUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOtpService) private readonly _otpService: IOtpService,
    @inject(TYPES.IEmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.ICacheService) private readonly _cache: ICacheService,
  ) {}

  /**
   * Send OTP
   */
  public async execute(email: string): Promise<{
    message: string;
    expiresAt: Date;
    attemptsRemaining: number;
  }> {
    this._logger.info("Sending OTP", { email });

    try {
      // Business Rule: Validate email format
      if (!this._isValidEmail(email)) {
        throw new ValidationError("Invalid email format");
      }

      // Business Rule: Check rate limiting
      const attemptsRemaining = await this._checkRateLimit(email);
      if (attemptsRemaining <= 0) {
        throw new TooManyRequestsError(
          "Too many OTP requests. Please wait before requesting again.",
        );
      }

      const otp = this._otpService.generateOtp(6); // 6-digit OTP
      const expiresAt = this._otpService.generateExpiry(1); // 1 minute from now

      await this._userRepo.ensureUserWithOtp(email, otp, expiresAt);

      // Send OTP via email
      await this._emailService.sendOtpEmail(email, otp, "Email verification");

      this._logger.info("OTP sent successfully", { email, expiresAt });

      return {
        message: "OTP sent successfully to your email",
        expiresAt,
        attemptsRemaining: attemptsRemaining - 1,
      };
    } catch (error) {
      this._logger.error("Failed to send OTP", error as Error, { email });
      throw error;
    }
  }

  /**
   * Resend OTP if previous one expired
   */
  public async resendOtp(email: string): Promise<{
    message: string;
    expiresAt: Date;
    attemptsRemaining: number;
  }> {
    this._logger.info("Resending OTP", { email });

    try {
      // Business Rule: Check if previous OTP is still valid
      const existingOtp = await this._userRepo.getOtp(email);
      if (existingOtp && existingOtp.expiresAt > new Date()) {
        const remainingTime = Math.ceil(
          (existingOtp.expiresAt.getTime() - Date.now()) / 1000 / 60,
        );
        throw new InvalidOperationError(
          `OTP is still valid. Please wait ${remainingTime} minutes before requesting a new one.`,
        );
      }

      // Use the same logic as execute
      return this.execute(email);
    } catch (error) {
      this._logger.error("Failed to resend OTP", error as Error, { email });
      throw error;
    }
  }

  /**
   * Check rate limiting for OTP requests
   * @param email - User email
   * @returns Number of attempts remaining
   */
  private async _checkRateLimit(email: string): Promise<number> {
    try {
      const MAX_ATTEMPTS_PER_HOUR = 5;
      const key = `otp:reqs:${email}`;
      const ttlSeconds = 60 * 60;

      const current = await this._cache.incr(key);
      if (current === 1) {
        await this._cache.expire(key, ttlSeconds);
      }

      const attemptsRemaining = Math.max(0, MAX_ATTEMPTS_PER_HOUR - current);
      return attemptsRemaining;
    } catch (error) {
      this._logger.error("Rate limit check failed", error as Error, { email });
      return 0;
    }
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns Whether email is valid
   */
  private _isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

