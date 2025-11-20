import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IAuthUseCases } from "../../domain/interfaces/useCases/IAuthUseCases";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { User } from "../../domain/entities/User";
import { IGoogleAuthService } from "../../domain/interfaces/services/IGoogleAuthService ";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
import { IResetPasswordUseCase } from "../../domain/interfaces/useCases/IResetPasswordUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";
import { IOrgRepo } from "../../domain/interfaces/IOrgRepo";
import { OrganizationStatus } from "../../domain/entities/Organization";
import { UserDTO, toUserDTO } from "../dto/UserDTO";
import { AuthResult, AuthTokens } from "../../domain/interfaces/useCases/types";
import { UserRole } from "../../domain/enums/UserRole";

type LoginArgs = { email: string; password: string } | [string, string];
type RegisterArgs =
  | { email: string; password: string; name?: string }
  | [string, string, string];

@injectable()
export class AuthUseCases implements IAuthUseCases {
  constructor(
    @inject(TYPES.IUserRepo) private readonly _userRepo: IUserRepo,
    @inject(TYPES.IHashService) private readonly _hashService: IHashService,
    @inject(TYPES.IJwtService) private readonly _jwtService: IJwtService,
    @inject(TYPES.IGoogleAuthService)
    private readonly _googleAuthService: IGoogleAuthService,
    @inject(TYPES.IResetPasswordUseCase)
    private readonly _resetPasswordUseCase: IResetPasswordUseCase,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
    @inject(TYPES.IOrgRepo) private readonly _orgRepo: IOrgRepo,
  ) {}

  /**
   * Helper: normalize args for login
   */
  private normalizeLoginArgs(args: LoginArgs): {
    email: string;
    password: string;
  } {
    if (Array.isArray(args)) {
      return { email: args[0], password: args[1] };
    }
    return args;
  }

  private normalizeRegisterArgs(args: RegisterArgs): {
    email: string;
    password: string;
    name?: string;
  } {
    if (Array.isArray(args)) {
      return { email: args[0], password: args[1], name: args[2] };
    }
    return args;
  }

  /**
   * REGISTER
   * Creates a new user, hashes password, returns a public user view and tokens.
   */
  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResult> {
    const existing = await this._userRepo.findByEmail(email);
    if (existing) {
      throw new Error("Email already in use");
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

    const publicUser: UserDTO = toUserDTO(created);

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

  async googleSignIn(
    idToken: string,
    inviteToken?: string,
  ): Promise<{ user: UserDTO; tokens: AuthTokens }> {
    const payload = await this._googleAuthService.verifyToken(idToken);

    const email = payload.email;
    const emailVerified = payload.email_verified;
    const googleSub = payload.sub;

    if (!email) throw new Error("Google Token missing email");

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
        // TODO: Validate invite token and extract org/role info
        // For now, create as team member (you can implement invite validation later)
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
          role: UserRole.TEAM_MEMBER, // Team member when coming from invite
          status: "ACTIVE",
          password: "",
          createdAt: new Date(),
        });
        user = newUser;
      } else {
        // Normal signup - create as organization member
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
          role: UserRole.ORG_MANAGER, // Organization member for normal signup
          status: "ACTIVE",
          password: "",
          createdAt: new Date(),
        });
        user = newUser;
      }
    }

    // Generate tokens
    if (!user) {
      throw new Error("User creation failed");
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

  /**
   * LOGIN - accepts either (email, password) or {email, password}
   * Returns shape expected by controller: { user, accessToken, refreshToken }
   */
  async login(email: string, password: string): Promise<AuthResult> {
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
        const superAdminPayload = {
          id: "super_admin",
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
      if (!user) throw new Error("Invalid credentials");

      if (!user.emailVerified) throw new Error("Email not verified");

      if (user.status !== "ACTIVE") {
        this._logger.warn("Login attempt by blocked/suspended user", {
          userId: user.id,
          email,
          status: user.status,
        });
        throw new Error("Account suspended or disabled");
      }

      if (user.orgId) {
        const org = await this._orgRepo.findById(user.orgId);
        if (!org) {
          this._logger.warn("Login attempt for user with deleted org", {
            userId: user.id,
            orgId: user.orgId,
          });
          throw new Error("Organization does not exist");
        }
        if (org.status !== OrganizationStatus.ACTIVE) {
          this._logger.warn("Login attempt by user from suspended org", {
            userId: user.id,
            orgId: user.orgId,
            orgStatus: org.status,
          });
          throw new Error("Organization suspended or disabled");
        }
      }

      const isPasswordValid = await this._hashService.compare(
        password,
        user.password,
      );
      if (!isPasswordValid) throw new Error("Invalid credentials");

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

  /**
   * REFRESH - accept refresh token string or object
   * Returns new access token (and optionally new refresh token if your jwtService rotates)
   */
  public async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this._jwtService.verifyRefreshToken(refreshToken);
      if (!payload) throw new Error("Invalid refresh token");

      const user = await this._userRepo.findById(payload.id);
      if (!user) throw new Error("User not found");

      if (user.status !== "ACTIVE") {
        this._logger.warn("Token refresh attempt by blocked user", {
          userId: user.id,
          status: user.status,
        });
        throw new Error("Account suspended or disabled");
      }

      if (user.orgId) {
        const org = await this._orgRepo.findById(user.orgId);
        if (!org) {
          this._logger.warn("Token refresh: org not found", {
            userId: user.id,
            orgId: user.orgId,
          });
          throw new Error("Organization not found");
        }
        if (org.status !== OrganizationStatus.ACTIVE) {
          this._logger.warn("Token refresh by user from suspended org", {
            userId: user.id,
            orgId: user.orgId,
            orgStatus: org.status,
          });
          throw new Error("Organization suspended or disabled");
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
      throw new Error("Invalid refresh token");
    }
  }

  /**
   * LOGOUT - revoke refresh token if service supports revocation
   */
  async logout(refreshToken?: string, userId?: string): Promise<void> {
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

  /**
   * Validate access token and return safe user DTO
   */
  async validateToken(token: string): Promise<UserDTO> {
    try {
      const payload = this._jwtService.verifyAccessToken(token);
      if (!payload) throw new Error("Invalid token");

      const user = await this._userRepo.findById(payload.id);
      if (!user) throw new Error("User not found");

      if (user.status !== "ACTIVE") throw new Error("User suspended");

      if (user.orgId) {
        const org = await this._orgRepo.findById(user.orgId);
        if (!org) throw new Error("Organization not found");
        if (org.status !== OrganizationStatus.ACTIVE)
          throw new Error("Organization suspended");
      }

      return toUserDTO(user);
    } catch (error) {
      this._logger.error("Token validation failed", error as Error);
      throw error;
    }
  }

  /**
   * Password reset delegations
   */
  async resetPasswordReq(
    email: string,
  ): Promise<{ message: string; token?: string }> {
    return this._resetPasswordUseCase.requestReset(email);
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return this._resetPasswordUseCase.resetWithToken(token, newPassword);
  }

  /**
   * Verify email token (assumes token payload contains id)
   */
  async verifyEmail(
    token: string,
  ): Promise<{ message: string; verified: boolean }> {
    try {
      // you may prefer a dedicated verification token signed by jwtService
      const payload = this._jwtService.verifyAccessToken(token);
      if (!payload) throw new Error("Invalid verification token");

      const user = await this._userRepo.findById(payload.id);
      if (!user) throw new Error("User not found");

      if (user.emailVerified)
        return { message: "Already verified", verified: true };

      await this._userRepo.verifyEmail(user.id);
      this._logger.info("Email verified", { userId: user.id });
      return { message: "Email verified", verified: true };
    } catch (error) {
      this._logger.error("Email verification failed", error as Error);
      throw new Error("Invalid or expired verification token");
    }
  }

  // Backwards compatibility: keep old method name if other parts call it
  async refreshToken(refreshToken: string) {
    return this.refresh(refreshToken);
  }
}
