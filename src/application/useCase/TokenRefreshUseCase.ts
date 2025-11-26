import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITokenRefreshUseCase } from "../../domain/interfaces/useCases/ITokenRefreshUseCase";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { AuthTokens } from "../../domain/interfaces/useCases/types";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class TokenRefreshUseCase implements ITokenRefreshUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  async execute(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this._jwtService.verifyRefreshToken(refreshToken);
      if (!payload)
        throw new HttpError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");

      const user = await this._userRepo.findById(payload.id);
      if (!user) throw new HttpError(StatusCodes.NOT_FOUND, "User not found");

      if (user.status !== "ACTIVE") {
        this._logger.warn("Token refresh attempt by blocked user", {
          userId: user.id,
          status: user.status,
        });
        throw new HttpError(
          StatusCodes.FORBIDDEN,
          "Account suspended or disabled",
        );
      }

      if (user.orgId) {
        const org = await this._orgRepo.findById(user.orgId);
        if (!org) {
          this._logger.warn("Token refresh: org not found", {
            userId: user.id,
            orgId: user.orgId,
          });
          throw new HttpError(StatusCodes.FORBIDDEN, "Organization not found");
        }
        if (org.status !== OrganizationStatus.ACTIVE) {
          this._logger.warn("Token refresh by user from suspended org", {
            userId: user.id,
            orgId: user.orgId,
            orgStatus: org.status,
          });
          throw new HttpError(
            StatusCodes.FORBIDDEN,
            "Organization suspended or disabled",
          );
        }
      }

      const newPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId ?? null,
      };
      const accessToken = this._jwtService.generateAccessToken(newPayload);
      const newRefresh = this._jwtService.generateRefreshToken(newPayload);

      return { accessToken, refreshToken: newRefresh, expiresIn: 3600 };
    } catch (error) {
      this._logger.error("Token refresh failed", error as Error);
      throw new HttpError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }
  }
}
