import { injectable, inject } from "inversify";
import {
  IJwtService,
  JwtPayload,
} from "../../application/interface/services/IJwtService";
import { ICacheService } from "../../application/interface/services/ICacheService";
import { IJwtProvider } from "../../application/interface/services/IJwtProvider";
import { TYPES } from "../container/types";
import { AppConfig } from "../../config/AppConfig";

/**
 * JWT Service Implementation
 * Uses dependency injection to receive a JWT provider and Cache service
 * Demonstrates the Open/Closed principle by depending on abstractions
 * Can be extended by injecting different JWT provider implementations
 */
@injectable()
export class JwtService implements IJwtService {
  private readonly _accessTokenSecret: string;
  private readonly _refreshTokenSecret: string;
  private readonly _resetTokenSecret: string;
  private readonly _accessTokenExpiry: string;
  private readonly _refreshTokenExpiry: string;
  private readonly _resetTokenExpiry: string;
  private readonly _issuer: string;
  private readonly _audience: string;

  private readonly REVOCATION_PREFIX = "revoked_token:";
  private readonly USER_REVOCATION_PREFIX = "user_revoked_at:";

  /**
   * Constructor with dependency injection
   * @param jwtProvider Implementation of IJwtProvider interface
   * @param cacheService Implementation of ICacheService for token revocation
   * @param config Implementation of strictly-typed AppConfig
   */
  constructor(
    @inject(TYPES.IJwtProvider) private readonly jwtProvider: IJwtProvider,
    @inject(TYPES.ICacheService) private readonly cacheService: ICacheService,
    @inject(TYPES.AppConfig) private readonly config: AppConfig,
  ) {
    // Get secrets from injected configuration
    this._accessTokenSecret = this.config.jwt.accessSecret;
    this._refreshTokenSecret = this.config.jwt.refreshSecret;
    this._resetTokenSecret = this.config.jwt.resetSecret;

    // Get token expiry times from injected configuration
    this._accessTokenExpiry = this.config.jwt.accessTokenExpiry;
    this._refreshTokenExpiry = this.config.jwt.refreshTokenExpiry;
    this._resetTokenExpiry = this.config.jwt.resetTokenExpiry;

    // Get issuer and audience from injected configuration
    this._issuer = this.config.jwt.issuer;
    this._audience = this.config.jwt.audience;
  }

  /**
   * Generate access token (short-lived)
   * @param payload Data to include in the token
   * @param expiresIn Optional override for token expiration
   * @returns Signed JWT access token
   */
  generateAccessToken(payload: JwtPayload, expiresIn?: string): string {
    try {
      const options = {
        expiresIn: expiresIn || this._accessTokenExpiry,
        issuer: this._issuer,
        audience: this._audience,
      };

      return this.jwtProvider.sign(payload, this._accessTokenSecret, options);
    } catch (error) {
      throw new Error(
        `Failed to generate access token: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Generate refresh token (long-lived)
   * @param payload Data to include in the token
   * @param expiresIn Optional override for token expiration
   * @returns Signed JWT refresh token
   */
  generateRefreshToken(payload: JwtPayload, expiresIn?: string): string {
    try {
      const options = {
        expiresIn: expiresIn || this._refreshTokenExpiry,
        issuer: this._issuer,
        audience: this._audience,
      };

      return this.jwtProvider.sign(payload, this._refreshTokenSecret, options);
    } catch (error) {
      throw new Error(
        `Failed to generate refresh token: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Verify access token
   * @param token JWT token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyAccessToken(token: string): JwtPayload | null {
    const options = {
      issuer: this._issuer,
      audience: this._audience,
    };
    try {
      const payload = this.jwtProvider.verify(
        token,
        this._accessTokenSecret,
        options,
      ) as JwtPayload | null;
      return payload ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Verify refresh token
   * @param token JWT token to verify
   * @returns Decoded payload or null if invalid
   */
  async verifyRefreshToken(token: string): Promise<JwtPayload | null> {
    try {
      const revoked = await this.cacheService.get(
        `${this.REVOCATION_PREFIX}${token}`,
      );
      if (revoked) return null;
    } catch {
      // Catch cache errors to prevent auth failure on Redis issues
    }

    const options = {
      issuer: this._issuer,
      audience: this._audience,
    };
    try {
      const payload = this.jwtProvider.verify(
        token,
        this._refreshTokenSecret,
        options,
      ) as JwtPayload | null;
      if (!payload) return null;

      if (payload.id) {
        const revokedAtStr = await this.cacheService.get(
          `${this.USER_REVOCATION_PREFIX}${payload.id}`,
        );
        if (revokedAtStr) {
          const revokedAt = parseInt(revokedAtStr, 10);
          if (payload.iat && typeof payload.iat == "number") {
            const issuedAtMs = payload.iat * 1000;
            if (revokedAt && issuedAtMs < revokedAt) {
              return null;
            }
          }
        }
      }
      return payload;
    } catch {
      return null;
    }
  }

  verifyResetToken(token: string): JwtPayload | null {
    const options = {
      issuer: this._issuer,
      audience: this._audience,
    };

    try {
      const payload = this.jwtProvider.verify(
        token,
        this._resetTokenSecret,
        options,
      ) as JwtPayload | null;
      return payload ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Generate password reset token
   * @param payload Data to include in the token
   * @param expiresIn Optional override for token expiration
   * @returns Signed JWT reset token
   */
  generateResetToken(payload: JwtPayload, expiresIn?: string): string {
    try {
      const options = {
        expiresIn: expiresIn || this._resetTokenExpiry,
        issuer: this._issuer,
        audience: this._audience,
      };

      return this.jwtProvider.sign(payload, this._resetTokenSecret, options);
    } catch (error) {
      throw new Error(
        `Failed to generate reset token: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Verify password reset token
   * @param token JWT token to verify
   * @returns Decoded payload or null if invalid
   */

  /**
   * Decode a JWT token without verification
   * @param token JWT token to decode
   * @returns Decoded payload or null if invalid format
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtProvider.decode(token) as JwtPayload | null;
    } catch {
      return null;
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      const decode = this.decodeToken(token);
      let ttlSeconds = 7 * 24 * 60 * 60; // Fallback 7 days

      if (decode && decode.exp && typeof decode.exp == "number") {
        const expiryMs = decode.exp * 1000;
        ttlSeconds = Math.max(0, Math.ceil((expiryMs - Date.now()) / 1000));
      }

      if (ttlSeconds > 0) {
        await this.cacheService.set(
          `${this.REVOCATION_PREFIX}${token}`,
          "revoked",
          ttlSeconds,
        );
      }
    } catch (err) {
      console.warn("Failed to revoke refresh token ", (err as Error).message);
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    try {
      const now = Date.now();
      await this.cacheService.set(
        `${this.USER_REVOCATION_PREFIX}${userId}`,
        String(now),
        30 * 24 * 60 * 60, // Keep revocation record for 30 days
      );
    } catch (err) {
      console.warn(
        "Failed to revoke all tokens for user ",
        (err as Error).message,
      );
    }
  }
}
