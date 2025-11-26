import { injectable, inject } from "inversify";
import {
  IJwtService,
  JwtPayload,
} from "../../domain/interfaces/services/IJwtService";
import { IJwtProvider } from "../../domain/interfaces/services/IJwtProvider";
import { TYPES } from "../container/types";

/**
 * JWT Service Implementation
 * Uses dependency injection to receive a JWT provider
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

  private readonly revokedRefreshedTokens = new Map<string, number>();
  private readonly revokeForAllUserMap = new Map<string, number>();

  /**
   * Constructor with dependency injection for JWT provider
   * @param jwtProvider Implementation of IJwtProvider interface
   */
  constructor(
    @inject(TYPES.IJwtProvider) private readonly jwtProvider: IJwtProvider,
  ) {
    // Get secrets from environment variables with fallbacks for development
    this._accessTokenSecret =
      process.env.JWT_ACCESS_SECRET ||
      "your-access-secret-key-change-in-production";
    this._refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET ||
      "your-refresh-secret-key-change-in-production";
    this._resetTokenSecret =
      process.env.JWT_RESET_SECRET ||
      "your-reset-secret-key-change-in-production";

    // Get token expiry times from environment variables with fallbacks
    this._accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || "30m";
    this._refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || "7d";
    this._resetTokenExpiry = process.env.JWT_RESET_EXPIRY || "1h";

    // Get issuer and audience from environment variables with fallbacks
    this._issuer = process.env.JWT_ISSUER || "project-hub";
    this._audience = process.env.JWT_AUDIENCE || "project-hub-users";

    // Warn if using default secrets in production
    if (process.env.NODE_ENV === "production") {
      if (
        !process.env.JWT_ACCESS_SECRET ||
        !process.env.JWT_REFRESH_SECRET ||
        !process.env.JWT_RESET_SECRET
      ) {
        console.error(
          "❌ WARNING: JWT secrets not set in production environment!",
        );
        throw new Error("JWT secrets must be set in production");
      }
    }
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
  verifyRefreshToken(token: string): JwtPayload | null {
    const revokedExpiry = this.revokedRefreshedTokens.get(token);

    if (revokedExpiry && revokedExpiry > Date.now()) {
      return null;
    }
    if (revokedExpiry && revokedExpiry <= Date.now()) {
      this.revokedRefreshedTokens.delete(token);
    }

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
      if (!payload) return null;

      if (payload.id && this.revokeForAllUserMap.has(payload.id)) {
        const revokedAt = this.revokeForAllUserMap.get(payload.id);

        if (payload.iat && typeof payload.iat == "number") {
          const issuedAtMs = payload.iat * 1000;
          if (revokedAt && issuedAtMs < revokedAt) {
            return null;
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
      if (decode && decode.exp && typeof decode.exp == "number") {
        const expiryMs = decode.exp * 1000;
        if (expiryMs > Date.now()) {
          this.revokedRefreshedTokens.set(token, expiryMs);
          const ttl = expiryMs - Date.now();
          setTimeout(
            () => {
              this.revokedRefreshedTokens.delete(token);
            },
            Math.max(0, ttl),
          );
        }
      } else {
        const fallbackExpiry = Date.now() + 24 * 60 * 60 * 1000;
        this.revokedRefreshedTokens.set(token, fallbackExpiry);
        setTimeout(
          () => {
            this.revokedRefreshedTokens.delete(token);
          },
          24 * 60 * 60 * 1000,
        );
      }
    } catch (err) {
      console.warn("Failed to revoke refresh token ", (err as Error).message);
    }
  }

  async revokeAllForUser(userId: string): Promise<void> {
    try {
      const now = Date.now();
      this.revokeForAllUserMap.set(userId, now);
    } catch (err) {
      console.warn(
        "Failed to revoke all tokens for user ",
        (err as Error).message,
      );
    }
  }
}
