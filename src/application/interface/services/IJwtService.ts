export type JwtPayload = {
  id: string;
  email: string;
  role?: string;
  orgId?: string | null;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
};

export interface IJwtService {
  /**
   * Generate access token
   * @param payload - Token payload
   * @param expiresIn - Token expiration time
   * @returns Access token
   */
  generateAccessToken(payload: JwtPayload, expiresIn?: string): string;

  /**
   * Generate refresh token
   * @param payload - Token payload
   * @param expiresIn - Token expiration time
   * @returns Refresh token
   */
  generateRefreshToken(payload: JwtPayload, expiresIn?: string): string;

  /**
   * Verify access token
   * @param token - Token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyAccessToken(token: string): JwtPayload | null;

  /**
   * Verify refresh token
   * @param token - Token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyRefreshToken(
    token: string,
  ): Promise<JwtPayload | null> | JwtPayload | null;

  /**
   * Generate password reset token
   * @param payload - Token payload
   * @param expiresIn - Token expiration time (optional)
   * @returns Reset token
   */
  generateResetToken(payload: JwtPayload, expiresIn?: string): string;

  /**
   * Verify password reset token
   * @param token - Token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyResetToken(token: string): JwtPayload | null;

  /**
   * Decode a JWT token without verification
   * @param token - JWT token to decode
   * @returns Decoded payload or null if invalid format
   */
  decodeToken(token: string): JwtPayload | null;

  revokeRefreshToken?: (token: string) => Promise<void> | void;
  revokeAllForUser?: (userId: string) => Promise<void> | void;
}
