import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { injectable } from "inversify";
import { IJwtProvider } from "../../../domain/interfaces/services/IJwtProvider";
import { JwtPayload, JwtOptions } from "../../../domain/types/jwt.types";

/**
 * Default JWT Provider implementation using jsonwebtoken library
 * Implements the IJwtProvider interface
 */
@injectable()
export class JsonWebTokenProvider implements IJwtProvider {
  /**
   * Sign a JWT token with the given payload and options
   * @param payload Data to include in the token
   * @param secret Secret key for signing
   * @param options Additional signing options
   * @returns Signed JWT token string
   */
  sign(payload: JwtPayload, secret: string, options?: JwtOptions): string {
    try {
      return jwt.sign(payload, secret, options as SignOptions);
    } catch (error) {
      throw new Error(`JWT signing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verify and decode a JWT token
   * @param token JWT token to verify
   * @param secret Secret key for verification
   * @param options Additional verification options
   * @returns Decoded payload or null if invalid
   */
  verify(
    token: string,
    secret: string,
    options?: JwtOptions,
  ): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, secret, options as VerifyOptions);

      // Handle both string and object returns
      if (typeof decoded === "string") {
        return JSON.parse(decoded);
      }

      return decoded as JwtPayload;
    } catch (error) {
      console.warn("JWT verification failed:", (error as Error).message);
      return null;
    }
  }

  /**
   * Decode a JWT token without verification
   * @param token JWT token to decode
   * @returns Decoded payload or null if invalid format
   */
  decode(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token);

      if (!decoded) {
        return null;
      }

      if (typeof decoded === "string") {
        return JSON.parse(decoded);
      }

      return decoded as JwtPayload;
    } catch (error) {
      console.warn("JWT decoding failed:", (error as Error).message);
      return null;
    }
  }
}
