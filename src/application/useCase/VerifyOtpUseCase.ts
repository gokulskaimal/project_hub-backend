import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IVerifyOtpUseCase } from "../../domain/interfaces/useCases/IVerifyOtpUseCase";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { ICacheService } from "../../domain/interfaces/services/ICacheService";

@injectable()
export class VerifyOtpUseCase implements IVerifyOtpUseCase {
  private readonly _userRepo: IUserRepo;
  private readonly _logger: ILogger;
  private readonly _cache: ICacheService;

  constructor(
    @inject(TYPES.IUserRepo) userRepo: IUserRepo,
    @inject(TYPES.ILogger) logger: ILogger,
    @inject(TYPES.ICacheService) cache: ICacheService,
  ) {
    this._userRepo = userRepo;
    this._logger = logger;
    this._cache = cache;
  }

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
        return {
          valid: false,
          message: "Email and OTP are required",
          verified: false,
        };
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

        return {
          valid: false,
          message:
            attemptsRemaining > 0
              ? `Invalid OTP. ${attemptsRemaining} attempts remaining.`
              : "Invalid OTP. Too many attempts. Please request a new OTP.",
          verified: false,
        };
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

      return {
        valid: false,
        message: "OTP verification failed. Please try again.",
        verified: false,
      };
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
