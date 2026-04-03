import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IVerifyEmailUseCase } from "../interface/useCases/IVerifyEmailUseCase";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { ILogger } from "../../application/interface/services/ILogger";
import { InvalidTokenError } from "../../domain/errors/AuthErrors";

@injectable()
export class VerifyEmailUseCase implements IVerifyEmailUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  async execute(
    token: string,
  ): Promise<{ message: string; verified: boolean }> {
    try {
      const user = await this._userRepo.findByVerificationToken(token);

      if (!user) {
        throw new InvalidTokenError("Invalid or expired verification token");
      }
      if (user.emailVerified) {
        return { message: "Email already verified", verified: true };
      }

      await this._userRepo.verifyEmail(user.id);
      this._logger.info("Email verified successfully", { userId: user.id });
      return { message: "Email verified successfully", verified: true };
    } catch (error) {
      this._logger.error("Error verifying email", error as Error);
      throw error;
    }
  }
}
