import { injectable } from "inversify";
import { IJwtProvider } from "../../../domain/interfaces/services/IJwtProvider";
import { JwtPayload, JwtOptions } from "../../../domain/types/jwt.types";

/**
 * Mock JWT Provider implementation for testing purposes
 * Implements the IJwtProvider interface
 * Demonstrates the Open/Closed principle by providing an alternative implementation
 */
@injectable()
export class MockJwtProvider implements IJwtProvider {
  private readonly _mockTokens: Map<string, JwtPayload> = new Map();

  /**
   * Sign a JWT token with the given payload and options
   * @param payload Data to include in the token
   * @param secret Secret key for signing (not used in mock)
   * @param options Additional signing options (not used in mock)
   * @returns Signed JWT token string
   */
  sign(payload: JwtPayload, secret: string, options?: JwtOptions): string {
    // Generate a simple mock token ID
    const tokenId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Store the payload with the token ID
    this._mockTokens.set(tokenId, { ...payload });

    // Log the secret and options for debugging purposes
    console.log(`Mock JWT signed with secret: ${secret}`);
    if (options) {
      console.log(`JWT options provided: ${JSON.stringify(options)}`);
    }

    return tokenId;
  }

  /**
   * Verify and decode a JWT token
   * @param token JWT token to verify
   * @param secret Secret key for verification (not used in mock)
   * @param options Additional verification options (not used in mock)
   * @returns Decoded payload or null if invalid
   */
  verify(
    token: string,
    secret: string,
    options?: JwtOptions,
  ): JwtPayload | null {
    // Check if the token exists in our mock storage
    if (this._mockTokens.has(token)) {
      // Log the secret and options for debugging purposes
      console.log(`Mock JWT verified with secret: ${secret}`);
      if (options) {
        console.log(`JWT verification options: ${JSON.stringify(options)}`);
      }

      return this._mockTokens.get(token) || null;
    }

    return null;
  }

  /**
   * Decode a JWT token without verification
   * @param token JWT token to decode
   * @returns Decoded payload or null if invalid format
   */
  decode(token: string): JwtPayload | null {
    // In this mock implementation, decode is the same as verify
    if (this._mockTokens.has(token)) {
      return this._mockTokens.get(token) || null;
    }

    return null;
  }

  /**
   * Clear all stored mock tokens
   * Additional method specific to the mock implementation
   */
  clearTokens(): void {
    this._mockTokens.clear();
  }
}
