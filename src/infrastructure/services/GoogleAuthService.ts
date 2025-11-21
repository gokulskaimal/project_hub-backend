import { OAuth2Client, TokenPayload } from "google-auth-library";
import { injectable } from "inversify";

@injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn(
        "WARNING: GOOGLE_CLIENT_ID is not defined in environment variables.",
      );
    }
    this.client = new OAuth2Client(clientId || "");
  }

  async verifyToken(idToken: string): Promise<TokenPayload> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google ID Token");
    return payload;
  }
}
