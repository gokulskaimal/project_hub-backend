import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ILogoutUseCase } from "../interface/useCases/ILogoutUseCase";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";

@injectable()
export class LogoutUseCase implements ILogoutUseCase {
  constructor(
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  async execute(refreshToken?: string, userId?: string): Promise<void> {
    try {
      if (
        refreshToken &&
        typeof this._jwtService.revokeRefreshToken === "function"
      ) {
        await this._jwtService.revokeRefreshToken(refreshToken);
      }
      // optionally revoke all tokens for a userId if provided
      if (userId && typeof this._jwtService.revokeAllForUser === "function") {
        await this._jwtService.revokeAllForUser(userId);
      }
      this._logger.info("User logged out", { userId });
    } catch (error) {
      this._logger.error("Logout failed", error as Error, { userId });
      throw error;
    }
  }
}
