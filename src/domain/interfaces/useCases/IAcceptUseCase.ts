/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IAcceptUseCase {
  /**
   * Accept organization invitation
   */
  execute(
    token: string,
    password: string,
    firstName: string,
    lastName: string,
    additionalData?: Record<string, any>,
  ): Promise<{
    user: any;
    organization: any;
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
    invitation?: any;
    expired?: boolean;
  }>;
}
