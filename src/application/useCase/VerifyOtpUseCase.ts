import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IVerifyOtpUseCase } from "../interface/useCases/IVerifyOtpUseCase";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IOtpService } from "../../application/interface/services/IOtpService";
import { ILogger } from "../../application/interface/services/ILogger";
import { ICacheService } from "../../application/interface/services/ICacheService";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { InvalidCredentialsError } from "../../domain/errors/AuthErrors";

@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOtpService) private readonly _otpService: IOtpService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.ICacheService) private readonly _cache: ICacheService,
    @inject(TYPES.IAuthValidationService)
    private readonly _authValidationService: IAuthValidationService,
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
      this._authValidationService.validateEmail(email);

      const isValid = await this._otpService.verifyOtp(email, otp);

      if (!isValid) {
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

      const user = await this._userRepo.findByEmail(email);
      if (!user) throw new InvalidCredentialsError("User not found");

      await this._userRepo.verifyEmail(user.id);
      await this._otpService.clearOtp(email);
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
