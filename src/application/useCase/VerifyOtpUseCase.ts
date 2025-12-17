import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IVerifyOtpUseCase } from "../interface/useCases/IVerifyOtpUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { ICacheService } from "../../infrastructure/interface/services/ICacheService";
import { ValidationError } from "../../domain/errors/CommonErrors";
import { InvalidCredentialsError } from "../../domain/errors/AuthErrors";

@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.ICacheService) private readonly _cache: ICacheService,
  ) {}

  public async execute(
    email: string,
    otp: string,
  ): Promise<{
    valid: boolean;
    message: string;
    verified: boolean;
  }> {
    this._logger.info("Verifying OTP", { email });

    try {
      if (!email || !otp) {
        throw new ValidationError("Email and OTP are required");
      }

      const user = await this._userRepo.verifyOtp(email, otp);

      if (!user) {
        const attemptsRemaining = await this.getAttemptsRemaining(email);
        const key = `otp:verify:${email}`;
        await this._cache.incr(key);

        this._logger.warn("OTP verification failed", {
          email,
          attemptsRemaining,
        });

        const message =
          attemptsRemaining > 0
            ? `Invalid OTP. ${attemptsRemaining} attempts remaining.`
            : "Invalid OTP. Too many attempts. Please request a new OTP.";

        throw new InvalidCredentialsError(message);
      }

      await this._userRepo.verifyEmail(user.id);
      await this._userRepo.saveOtp(email, "", new Date());
      await this._cache.del(`otp:verify:${email}`);

      this._logger.info("OTP verified successfully", {
        email,
        userId: user.id,
      });

      return {
        valid: true,
        message: "OTP verified successfully",
        verified: true,
      };
    } catch (error) {
      this._logger.error("OTP verification failed", error as Error, { email });
      throw error;
    }
  }

  public async getAttemptsRemaining(email: string): Promise<number> {
    this._logger.info("Checking OTP attempts remaining", { email });

    try {
      const MAX_ATTEMPTS = 3;
      const key = `otp:verify:${email}`;
      const used = Number(await this._cache.get(key)) || 0;
      const remaining = Math.max(0, MAX_ATTEMPTS - used);
      return remaining;
    } catch (error) {
      this._logger.error("Failed to get attempts remaining", error as Error, {
        email,
      });
      return 0;
    }
  }
}

