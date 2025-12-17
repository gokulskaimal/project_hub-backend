import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IRegisterUseCase } from "../interface/useCases/IRegisterUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { User } from "../../domain/entities/User";
import { toUserDTO } from "../dto/UserDTO";
import { AuthResult } from "../interface/useCases/types";
import { ConflictError } from "../../domain/errors/CommonErrors";

@injectable()
export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  async execute(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResult> {
    const existing = await this._userRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    const hashed = await this._hashService.hash(password);

    // Create domain user
    const created = await this._userRepo.create({
      email,
      password: hashed,
      name,
      status: "ACTIVE",
      emailVerified: false, // depends on your flow
      createdAt: new Date(),
    } as Partial<User>);

    // Optionally sign tokens. If you prefer not to sign on register, remove these.
    const payload = {
      id: created.id,
      email: created.email,
      role: created.role,
      orgId: created.orgId ?? null,
    };

    const accessToken = this._jwtService.generateAccessToken(payload);
    const refreshToken = this._jwtService.generateRefreshToken(payload);

    const publicUser = toUserDTO(created);

    this._logger.info("User registered", { userId: created.id, email });

    return {
      user: publicUser,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      },
    };
  }
}

