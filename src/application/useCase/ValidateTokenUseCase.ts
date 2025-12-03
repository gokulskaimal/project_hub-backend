import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IValidateTokenUseCase } from "../interface/useCases/IValidateTokenUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { toUserDTO, UserDTO } from "../dto/UserDTO";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

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
      if (!payload)
        throw new HttpError(StatusCodes.UNAUTHORIZED, "Invalid token");

      const user = await this._userRepo.findById(payload.id);
      if (!user) throw new HttpError(StatusCodes.NOT_FOUND, "User not found");

      if (user.status !== "ACTIVE")
        throw new HttpError(StatusCodes.FORBIDDEN, "User suspended");

      if (user.orgId) {
        const org = await this._orgRepo.findById(user.orgId);
        if (!org)
          throw new HttpError(StatusCodes.FORBIDDEN, "Organization not found");
        if (org.status !== OrganizationStatus.ACTIVE)
          throw new HttpError(StatusCodes.FORBIDDEN, "Organization suspended");
      }

      return toUserDTO(user);
    } catch (error) {
      this._logger.error("Token validation failed", error as Error);
      throw error;
    }
  }
}
