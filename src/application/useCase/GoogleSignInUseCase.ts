import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IGoogleSignInUseCase } from "../interface/useCases/IGoogleSignInUseCase";
import { IUserRepo } from "../../infrastructure/interface/repositories/IUserRepo";
import { IOrgRepo } from "../../infrastructure/interface/repositories/IOrgRepo";
import { IGoogleAuthService } from "../../infrastructure/interface/services/IGoogleAuthService ";
import { IJwtService } from "../../infrastructure/interface/services/IJwtService";
import { ILogger } from "../../infrastructure/interface/services/ILogger";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { UserRole } from "../../domain/enums/UserRole";
import { toUserDTO, UserDTO } from "../dto/UserDTO";
import { AuthTokens } from "../interface/useCases/types";
import {
  ValidationError,
  ConflictError,
} from "../../domain/errors/CommonErrors";
import {
  AccountSuspendedError,
  OrganizationSuspendedError,
} from "../../domain/errors/AuthErrors";

@injectable()
export class GoogleSignInUseCase implements IGoogleSignInUseCase {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
    @inject(TYPES.IGoogleAuthService)
    private readonly _googleAuthService: IGoogleAuthService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {}

  async execute(
    idToken: string,
    inviteToken?: string,
    orgName?: string,
  ): Promise<{ user: UserDTO; tokens: AuthTokens }> {
    const payload = await this._googleAuthService.verifyToken(idToken);

    const email = payload.email;
    const emailVerified = payload.email_verified;
    const googleSub = payload.sub;

    if (!email) throw new ValidationError("Google Token missing email");

    let user = await this._userRepo.findByEmail(email);

    if (user) {
      // Existing user - update Google info if needed
      if (!user.googleId && user.password) {
        await this._userRepo.updateProfile(user.id, {
          provider: "google",
          googleId: googleSub,
          emailVerified: emailVerified,
        });
        user = await this._userRepo.findById(user.id);
      }
    } else {
      // New user - check if coming from invite
      if (inviteToken) {
        const invitePayload = this._jwtService.verifyAccessToken(inviteToken);

        if (!invitePayload) {
          throw new ValidationError("Invalid or expired invite token");
        }

        const orgId = invitePayload.orgId;

        if (!orgId || typeof orgId !== "string") {
          throw new ValidationError("Invalid organization in invite token");
        }

        const assignedRole = Object.values(UserRole).includes(
          invitePayload.role as UserRole,
        )
          ? (invitePayload.role as UserRole)
          : UserRole.TEAM_MEMBER;
        const org = await this._orgRepo.findById(orgId);
        if (!org) {
          throw new ValidationError("Invalid Organization");
        }

        const newUser = await this._userRepo.create({
          email,
          emailVerified: emailVerified,
          provider: "google",
          googleId: googleSub,
          name:
            payload.name ||
            `${payload.given_name || " "} ${payload.family_name || " "}`.trim(),
          firstName: payload.given_name,
          lastName: payload.family_name,
          avatar: payload.picture,
          orgId: orgId,
          role: assignedRole,
          // Team member when coming from invite
          status: "ACTIVE",
          password: "",
          createdAt: new Date(),
        });
        user = newUser;

        this._logger.info("New user created from invite via Google", {
          userId: newUser.id,
          email,
          inviteToken: inviteToken.substring(0, 8) + "...",
        });
      } else {
        // Normal signup - REQUIRES Organization Name
        if (!orgName) {
          throw new ValidationError("Organization Name Required");
        }

        // Create Organization
        let newOrg;
        try {
          newOrg = await this._orgRepo.create({
            name: orgName,
            status: OrganizationStatus.ACTIVE,
            createdAt: new Date(),
            // You might want to add more default fields here
          });
        } catch (error: unknown) {
          if ((error as { code?: number }).code === 11000) {
            throw new ConflictError("Organization name already exists");
          }
          throw error;
        }

        // Create User as ORG_MANAGER linked to new Org
        const newUser = await this._userRepo.create({
          email,
          emailVerified: emailVerified,
          provider: "google",
          googleId: googleSub,
          name:
            payload.name ||
            `${payload.given_name || " "} ${payload.family_name || " "}`.trim(),
          firstName: payload.given_name,
          lastName: payload.family_name,
          avatar: payload.picture,
          role: UserRole.ORG_MANAGER,
          orgId: newOrg.id, // Link to created org
          status: "ACTIVE",
          password: "",
          createdAt: new Date(),
        });
        user = newUser;

        this._logger.info("New user created as org manager via Google", {
          userId: newUser.id,
          email,
          orgId: newOrg.id,
        });
      }
    }

    // Generate tokens
    if (!user) {
      throw new Error("User creation failed");
    }

    if (user.status !== "ACTIVE") {
      throw new AccountSuspendedError();
    }

    if (user.orgId) {
      const org = await this._orgRepo.findById(user.orgId);
      if (org && org.status !== OrganizationStatus.ACTIVE) {
        throw new OrganizationSuspendedError();
      }
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId ?? null,
    };

    const accessToken = this._jwtService.generateAccessToken(tokenPayload);
    const refreshToken = this._jwtService.generateRefreshToken(tokenPayload);

    const publicUser = toUserDTO(user);

    this._logger.info("Google sign-in successful", {
      userId: user.id,
      email,
      isInviteSignup: !!inviteToken,
      role: user.role,
    });

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

