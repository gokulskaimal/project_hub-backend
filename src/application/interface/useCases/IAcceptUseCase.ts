import { User } from "../../../domain/entities/User";
import { Organization } from "../../../domain/entities/Organization";
import { Invite } from "../../../domain/entities/Invite";

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
    user: Partial<User>;
    organization: Partial<Organization>;
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
    invitation?: Partial<Invite>;
    expired?: boolean;
  }>;
}
