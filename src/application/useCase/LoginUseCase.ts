import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { ILoginUseCase } from "../interface/useCases/ILoginUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IHashService } from "../../infrastructure/interface/services/IHashService";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { toUserDTO } from "../dto/UserDTO";
import { AuthResult } from "../interface/useCases/types";
import { UserRole } from "../../domain/enums/UserRole";
import { HttpError } from "../../utils/asyncHandler";
import { StatusCodes } from "../../infrastructure/config/statusCodes.enum";

@injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
  ) {}

  async execute(email: string, password: string): Promise<AuthResult> {
    this._logger.info("User login attempt", { email });

    try {
      // Super-admin check (env)
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

      if (
        superAdminEmail &&
        superAdminPassword &&
        email === superAdminEmail &&
        password === superAdminPassword
      ) {
        // Try to find the real user in DB to get the correct ID
        const existingSuperAdmin = await this._userRepo.findByEmail(email);
        const realId = existingSuperAdmin
          ? existingSuperAdmin.id
          : "super_admin";

        const superAdminPayload = {
          id: realId,
          email,
          role: UserRole.SUPER_ADMIN,
          emailVerified: true,
          status: "ACTIVE",
          orgId: null,
          createdAt: new Date().toISOString(),
        };
        const accessToken =
          this._jwtService.generateAccessToken(superAdminPayload);
        const refreshToken =
          this._jwtService.generateRefreshToken(superAdminPayload);

        return {
          user: superAdminPayload,
          tokens: {
            accessToken,
            refreshToken,
          },
        };
      }

      const user = await this._userRepo.findByEmail(email);
      if (!user)
        throw new HttpError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

      if (!user.emailVerified)
        throw new HttpError(StatusCodes.FORBIDDEN, "Email not verified");

      if (user.status !== "ACTIVE") {
        this._logger.warn("Login attempt by blocked/suspended user", {
          userId: user.id,
          email,
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
          this._logger.warn("Login attempt for user with deleted org", {
            userId: user.id,
            orgId: user.orgId,
          });
          throw new HttpError(
            StatusCodes.FORBIDDEN,
            "Organization does not exist",
          );
        }
        if (org.status !== OrganizationStatus.ACTIVE) {
          this._logger.warn("Login attempt by user from suspended org", {
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

      const isPasswordValid = await this._hashService.compare(
        password,
        user.password,
      );
      if (!isPasswordValid)
        throw new HttpError(StatusCodes.UNAUTHORIZED, "Invalid credentials");

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      };

      const accessToken = this._jwtService.generateAccessToken(payload);
      const refreshToken = this._jwtService.generateRefreshToken(payload);

      await this._userRepo.updateLastLogin(user.id, new Date());
      this._logger.info("User login successful", { userId: user.id, email });

      // sanitize user before returning
      const publicUser = toUserDTO(user);

      return {
        user: publicUser,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600,
        },
      };
    } catch (error) {
      this._logger.error("User login failed", error as Error, { email });
      throw error;
    }
  }
}
