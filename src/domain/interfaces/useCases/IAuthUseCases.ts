/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IAuthUseCases {
  /**
   * User login with email and password
   */
  login(
    email: string,
    password: string,
  ): Promise<{
    user: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }>;

  /**
   * Logout user (invalidate tokens)
   */
  logout(userId: string, refreshToken: string): Promise<void>;

  /**
   * Validate access token
   */
  validateToken(token: string): Promise<any>;

  /**
   * ✅ ADDED: Request password reset - REQUIRED BY AuthController
   */
  resetPasswordReq(email: string): Promise<{ message: string; token?: string }>;

  /**
   * ✅ ADDED: Reset password with token - REQUIRED BY AuthController
   */
  resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }>;

  /**
   * ✅ ADDED: Verify email - REQUIRED BY AuthController
   */
  verifyEmail(token: string): Promise<{ message: string; verified: boolean }>;
}
