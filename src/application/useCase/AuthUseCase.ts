/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable, inject } from "inversify";
import { TYPES } from "../../infrastructure/container/types";
import { IAuthUseCases } from "../../domain/interfaces/useCases/IAuthUseCases";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { IHashService } from "../../domain/interfaces/services/IHashService";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
import { IResetPasswordUseCase } from "../../domain/interfaces/useCases/IResetPasswordUseCase";
import { ILogger } from "../../domain/interfaces/services/ILogger";

@injectable()
export class AuthUseCases implements IAuthUseCases {
  private readonly _userRepo: IUserRepo;
  private readonly _hashService: IHashService;
  private readonly _jwtService: IJwtService;
  private readonly _resetPasswordUseCase: IResetPasswordUseCase;
  private readonly _logger: ILogger;

  constructor(
    @inject(TYPES.IUserRepo) userRepo: IUserRepo,
    @inject(TYPES.IHashService) hashService: IHashService,
    @inject(TYPES.IJwtService) jwtService: IJwtService,
    @inject(TYPES.IResetPasswordUseCase)
    resetPasswordUseCase: IResetPasswordUseCase,
    @inject(TYPES.ILogger) logger: ILogger,
  ) {
    this._userRepo = userRepo;
    this._hashService = hashService;
    this._jwtService = jwtService;
    this._resetPasswordUseCase = resetPasswordUseCase;
    this._logger = logger;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    user: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }> {
    this._logger.info("User login attempt", { email });

    try {
      const user = await this._userRepo.findByEmail(email);
      if (!user) {
        throw new Error("Invalid credentials");
      }

      if (!user.emailVerified) {
        throw new Error("Email not verified");
      }

      const isPasswordValid = await this._hashService.compare(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

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

      const {
        password: _,
        otp,
        otpExpiry,
        resetPasswordToken,
        resetPasswordExpires,
        ...safeUser
      } = user;

      return {
        user: safeUser,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600, // 1 hour
        },
      };
    } catch (error) {
      this._logger.error("User login failed", error as Error, { email });
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const payload = this._jwtService.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new Error("Invalid refresh token");
      }

      const user = await this._userRepo.findById(payload.id);
      if (!user) {
        throw new Error("User not found");
      }

      const newPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      };

      const accessToken = this._jwtService.generateAccessToken(newPayload);

      return {
        accessToken,
        expiresIn: 3600,
      };
    } catch (error) {
      this._logger.error("Token refresh failed", error as Error);
      throw new Error("Invalid refresh token");
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      // In a real implementation, you would blacklist the tokens
      this._logger.info("User logged out", { userId });
    } catch (error) {
      this._logger.error("Logout failed", error as Error, { userId });
      throw error;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this._jwtService.verifyAccessToken(token);
      if (!payload) {
        throw new Error("Invalid token");
      }

      const user = await this._userRepo.findById(payload.id);
      if (!user) {
        throw new Error("User not found");
      }

      const {
        password: _,
        otp,
        otpExpiry,
        resetPasswordToken,
        resetPasswordExpires,
        ...safeUser
      } = user;
      return safeUser;
    } catch (error) {
      this._logger.error("Token validation failed", error as Error);
      throw error;
    }
  }

  /**
   * ✅ ADDED: Request password reset - REQUIRED BY AuthController
   */
  async resetPasswordReq(
    email: string,
  ): Promise<{ message: string; token?: string }> {
    return this._resetPasswordUseCase.requestReset(email);
  }

  /**
   * ✅ ADDED: Reset password with token - REQUIRED BY AuthController
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return this._resetPasswordUseCase.resetWithToken(token, newPassword);
  }

  /**
   * ✅ ADDED: Verify email - REQUIRED BY AuthController
   */
  async verifyEmail(
    token: string,
  ): Promise<{ message: string; verified: boolean }> {
    try {
      const payload = this._jwtService.verifyAccessToken(token);
      if (!payload) {
        throw new Error("Invalid verification token");
      }

      const user = await this._userRepo.findById(payload.id);
      if (!user) {
        throw new Error("User not found");
      }

      if (user.emailVerified) {
        return {
          message: "Email already verified",
          verified: true,
        };
      }

      await this._userRepo.verifyEmail(user.id);

      this._logger.info("Email verified successfully", { userId: user.id });

      return {
        message: "Email verified successfully",
        verified: true,
      };
    } catch (error) {
      this._logger.error("Email verification failed", error as Error);
      throw new Error("Invalid or expired verification token");
    }
  }
}
