import { OAuth2Client, TokenPayload } from "google-auth-library";
import { injectable, inject } from "inversify";
import { TYPES } from "../container/types";
import { AppConfig } from "../../config/AppConfig";
import { ILogger } from "../../application/interface/services/ILogger";

@injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(
    @inject(TYPES.AppConfig) private readonly config: AppConfig,
    @inject(TYPES.ILogger) private readonly _logger: ILogger,
  ) {
    const clientId = this.config.google.clientId;
    if (!clientId) {
      this._logger.warn(
        "WARNING: GOOGLE_CLIENT_ID is not defined in environment variables.",
      );
    }
    this.client = new OAuth2Client(clientId || "");
  }

  async verifyToken(idToken: string): Promise<TokenPayload> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google ID Token");
    return payload;
  }
}
