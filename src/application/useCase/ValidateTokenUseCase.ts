import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IValidateTokenUseCase } from "../interface/useCases/IValidateTokenUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { toUserDTO, UserDTO } from "../dto/UserDTO";
import { EntityNotFoundError } from "../../domain/errors/CommonErrors";
import {
  InvalidTokenError,
  AccountSuspendedError,
  OrganizationNotFoundError,
  OrganizationSuspendedError,
} from "../../domain/errors/AuthErrors";

@injectable()
export class ValidateTokenUseCase implements IValidateTokenUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  async execute(token: string): Promise<UserDTO> {
    try {
      const payload = this._jwtService.verifyAccessToken(token);
      if (!payload) throw new InvalidTokenError();

      const user = await this._userRepo.findById(payload.id);
      if (!user) throw new EntityNotFoundError("User", payload.id);

      if (user.status !== "ACTIVE") throw new AccountSuspendedError();

      if (user.orgId) {
        const org = await this._orgRepo.findById(user.orgId);
        if (!org) throw new OrganizationNotFoundError();
        if (org.status !== OrganizationStatus.ACTIVE)
          throw new OrganizationSuspendedError();
      }

      return toUserDTO(user);
    } catch (error) {
      this._logger.error("Token validation failed", error as Error);
      throw error;
    }
  }
}

