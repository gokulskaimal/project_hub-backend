import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IVerifyEmailUseCase } from "../interface/useCases/IVerifyEmailUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class VerifyEmailUseCase implements IVerifyEmailUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  async execute(
    token: string,
  ): Promise<{ message: string; verified: boolean }> {
    try {
      // you may prefer a dedicated verification token signed by jwtService
      const payload = this._jwtService.verifyAccessToken(token);
      if (!payload)
        throw new HttpError(
          StatusCodes.BAD_REQUEST,
          "Invalid verification token",
        );

      const user = await this._userRepo.findById(payload.id);
      if (!user) throw new HttpError(StatusCodes.NOT_FOUND, "User not found");

      if (user.emailVerified)
        return { message: "Already verified", verified: true };

      await this._userRepo.verifyEmail(user.id);
      this._logger.info("Email verified", { userId: user.id });
      return { message: "Email verified", verified: true };
    } catch (error) {
      this._logger.error("Email verification failed", error as Error);
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        "Invalid or expired verification token",
      );
    }
  }
}
