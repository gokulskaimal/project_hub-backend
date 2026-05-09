import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IRegisterUseCase } from "../interface/useCases/IRegisterUseCase";
import { IUserRepo } from "../../application/interface/repositories/IUserRepo";
import { IHashService } from "../../application/interface/services/IHashService";
import { IJwtService } from "../../application/interface/services/IJwtService";
import { IEmailService } from "../interface/services/IEmailService";
import { ILogger } from "../../application/interface/services/ILogger";
import { User } from "../../domain/entities/User";
import { toUserDTO } from "../dto/UserDTO";
import { AuthResult } from "../interface/useCases/types";
import { IAuthValidationService } from "../../application/interface/services/IAuthValidationService";
import { ConflictError } from "../../domain/errors/CommonErrors";

@injectable()
export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.IEmailService) private readonly _emailService: IEmailService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IAuthValidationService)
    private readonly _authValidationService: IAuthValidationService,
  ) {}

  private _generateOpaqueToken(length: number = 64): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let token = "";
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  async execute(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResult> {
    this._authValidationService.validateEmail(email);
    this._authValidationService.validatePassword(password);

    const existing = await this._userRepo.findByEmail(email);
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    const hashed = await this._hashService.hash(password);

    const verificationToken = this._generateOpaqueToken(64);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create domain user
    const created = await this._userRepo.create({
      email,
      password: hashed,
      name,
      status: "ACTIVE",
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpiry,
      createdAt: new Date(),
    } as Partial<User>);

    await this._emailService.sendVerificationEmail(
      email,
      name || "User",
      verificationToken,
    );

    // Optionally sign tokens. If you prefer not to sign on register, remove these.
    const payload = {
      id: created.id,
      email: created.email,
      role: (created.role as string).replace(/\s+/g, "_"),
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
