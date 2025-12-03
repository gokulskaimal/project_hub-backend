export interface IInviteMemberUseCase {
  /**
   * Invite member to organization
   */
  execute(
    email: string,
    orgId: string,
    role?: string,
  ): Promise<{
    invitationId: string;
    token: string;
    expiresAt: Date;
    message: string;
  }>;

  /**
   * Bulk invite members
   */
  bulkInvite(
    emails: string[],
    orgId: string,
    role?: string,
  ): Promise<{
    successful: Array<{ email: string; invitationId: string }>;
    failed: Array<{ email: string; error: string }>;
    summary: { total: number; successful: number; failed: number };
  }>;
}
