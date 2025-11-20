import { User } from "../../entities/User";
import { Organization } from "../../entities/Organization";
import { AuthTokens } from "./types";

export interface IInviteSignupUseCase {
  /**
   * Complete signup via invitation
   */
  execute(
    inviteToken: string,
    userData: {
      password: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<{
    user: User;
    organization: Organization;
    tokens: AuthTokens;
  }>;

  /**
   * Get invitation details
   */
  getInvitationDetails(token: string): Promise<{
    email: string;
    organizationName: string;
    invitedBy: string;
    expiresAt: Date;
    role?: string;
  }>;
}
