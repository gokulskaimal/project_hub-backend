import { UserDTO } from "../../dto/UserDTO";
import { InviteDTO } from "../../dto/InviteDTO";

export interface IAcceptUseCase {
  /**
   * Accept organization invitation
   */
  execute(
    token: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData?: Record<string, unknown>,
  ): Promise<{
    user: UserDTO;
    organization: { id: string; name: string; status: string };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  }>;

  /**
   * Validate invitation token
   */
  validateInvitationToken(token: string): Promise<{
    valid: boolean;
    invitation?: InviteDTO;
    expired?: boolean;
    cancelled?: boolean;
    accepted?: boolean;
  }>;
}
