/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable, inject } from "inversify";
import { IJwtService } from "../../domain/interfaces/services/IJwtService";
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
    this._accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || "15m";
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
  generateAccessToken(
    payload: Record<string, any>,
    expiresIn?: string,
  ): string {
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
  generateRefreshToken(
    payload: Record<string, any>,
    expiresIn?: string,
  ): string {
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
  verifyAccessToken(token: string): Record<string, any> | null {
    const options = {
      issuer: this._issuer,
      audience: this._audience,
    };

    return this.jwtProvider.verify(token, this._accessTokenSecret, options);
  }

  /**
   * Verify refresh token
   * @param token JWT token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyRefreshToken(token: string): Record<string, any> | null {
    const options = {
      issuer: this._issuer,
      audience: this._audience,
    };

    return this.jwtProvider.verify(token, this._refreshTokenSecret, options);
  }

  /**
   * Generate password reset token
   * @param payload Data to include in the token
   * @param expiresIn Optional override for token expiration
   * @returns Signed JWT reset token
   */
  generateResetToken(payload: Record<string, any>, expiresIn?: string): string {
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
  verifyResetToken(token: string): Record<string, any> | null {
    const options = {
      issuer: this._issuer,
      audience: this._audience,
    };

    return this.jwtProvider.verify(token, this._resetTokenSecret, options);
  }

  /**
   * Decode a JWT token without verification
   * @param token JWT token to decode
   * @returns Decoded payload or null if invalid format
   */
  decodeToken(token: string): Record<string, any> | null {
    return this.jwtProvider.decode(token);
  }

  // End of JwtService implementation
}
