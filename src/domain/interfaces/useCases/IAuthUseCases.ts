import { UserDTO } from "../../../application/dto/UserDTO";
import { AuthTokens, AuthResult } from "./types";

export interface IAuthUseCases {
  login(email: string, password: string): Promise<AuthResult>;

  register(email: string, password: string, name?: string): Promise<AuthResult>;

  googleSignIn(
    idToken: string,
    inviteToken?: string,
  ): Promise<{ user: UserDTO; tokens: AuthTokens }>;

  refresh(refreshToken: string): Promise<AuthTokens>;

  logout(userId?: string, refreshToken?: string): Promise<void>;

  validateToken(token: string): Promise<UserDTO>;

  resetPasswordReq(email: string): Promise<{ message: string; token?: string }>;

  resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }>;

  verifyEmail(token: string): Promise<{ message: string; verified: boolean }>;
}
