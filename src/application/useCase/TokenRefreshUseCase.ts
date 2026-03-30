import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ITokenRefreshUseCase } from "../interface/useCases/ITokenRefreshUseCase";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../application/interface/repositories/IOrgRepo";
import { IJwtService } from "../../application/interface/services/IJwtService";
import { ILogger } from "../../application/interface/services/ILogger";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { AuthTokens } from "../interface/useCases/types";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import {
  InvalidTokenError,
  AccountSuspendedError,
  OrganizationNotFoundError,
  OrganizationSuspendedError,
} from "../../domain/errors/AuthErrors";

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
      const payload = await this._jwtService.verifyRefreshToken(refreshToken);
      if (!payload) throw new InvalidTokenError("Invalid refresh token");

      const user = await this._userRepo.findById(payload.id);
      if (!user) throw new EntityNotFoundError("User", payload.id);

      if (user.status !== "ACTIVE") {
        this._logger.warn("Token refresh attempt by blocked user", {
          userId: user.id,
          status: user.status,
        });
        throw new AccountSuspendedError();
      }

      if (user.orgId) {
        const org = await this._orgRepo.findById(user.orgId);
        if (!org) {
          this._logger.warn("Token refresh: org not found", {
            userId: user.id,
            orgId: user.orgId,
          });
          throw new OrganizationNotFoundError();
        }
        if (org.status !== OrganizationStatus.ACTIVE) {
          this._logger.warn("Token refresh by user from suspended org", {
            userId: user.id,
            orgId: user.orgId,
            orgStatus: org.status,
          });
          throw new OrganizationSuspendedError();
        }
      }

      const newPayload = {
        id: user.id,
        email: user.email,
        role: (user.role as string).replace(/\s+/g, "_"),
        orgId: user.orgId ? user.orgId.toString() : "",
      };
      const accessToken = this._jwtService.generateAccessToken(newPayload);
      const newRefresh = this._jwtService.generateRefreshToken(newPayload);

      // Strict Rotation: Revoke the old token after it has been used once
      if (typeof this._jwtService.revokeRefreshToken === "function") {
        await this._jwtService.revokeRefreshToken(refreshToken);
      }

      return { accessToken, refreshToken: newRefresh, expiresIn: 3600 };
    } catch (error) {
      if (
        error instanceof AccountSuspendedError ||
        error instanceof OrganizationNotFoundError ||
        error instanceof OrganizationSuspendedError
      ) {
        throw error;
      }
      this._logger.error("Token refresh failed", error as Error);
      throw new InvalidTokenError("Invalid refresh token");
    }
  }
}
