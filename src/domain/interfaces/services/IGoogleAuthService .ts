import { TokenPayload } from "google-auth-library";

export interface IGoogleAuthService {
  verifyToken(idToken: string): Promise<TokenPayload>;
}
