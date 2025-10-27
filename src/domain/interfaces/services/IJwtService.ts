/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * JWT Service Interface
 * Defines the contract for JWT token generation, verification, and management
 * Used for authentication and authorization throughout the application
 */
export interface IJwtService {
  /**
   * Generate access token
   * @param payload - Token payload
   * @param expiresIn - Token expiration time
   * @returns Access token
   */
  generateAccessToken(payload: Record<string, any>, expiresIn?: string): string;

  /**
   * Generate refresh token
   * @param payload - Token payload
   * @param expiresIn - Token expiration time
   * @returns Refresh token
   */
  generateRefreshToken(
    payload: Record<string, any>,
    expiresIn?: string,
  ): string;

  /**
   * Verify access token
   * @param token - Token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyAccessToken(token: string): Record<string, any> | null;

  /**
   * Verify refresh token
   * @param token - Token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyRefreshToken(token: string): Record<string, any> | null;

  /**
   * Generate password reset token
   * @param payload - Token payload
   * @param expiresIn - Token expiration time (optional)
   * @returns Reset token
   */
  generateResetToken(payload: Record<string, any>, expiresIn?: string): string;

  /**
   * Verify password reset token
   * @param token - Token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyResetToken(token: string): Record<string, any> | null;

  /**
   * Decode a JWT token without verification
   * @param token - JWT token to decode
   * @returns Decoded payload or null if invalid format
   */
  decodeToken(token: string): Record<string, any> | null;
}
