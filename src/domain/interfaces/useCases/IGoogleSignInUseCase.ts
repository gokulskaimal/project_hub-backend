import { UserDTO } from "../../../application/dto/UserDTO";
import { AuthTokens } from "./types";

export interface IGoogleSignInUseCase {
  execute(
    idToken: string,
    inviteToken?: string,
    orgName?: string,
  ): Promise<{ user: UserDTO; tokens: AuthTokens }>;
}
