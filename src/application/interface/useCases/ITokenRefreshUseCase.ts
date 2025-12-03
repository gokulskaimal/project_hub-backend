import { AuthTokens } from "./types";

export interface ITokenRefreshUseCase {
  execute(refreshToken: string): Promise<AuthTokens>;
}
