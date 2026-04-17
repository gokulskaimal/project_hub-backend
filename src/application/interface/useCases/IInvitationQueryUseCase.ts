import { Invite } from "../../../domain/entities/Invite";

export interface IInvitationQueryUseCase {
  listInvitations(
    limit: number,
    offset: number,
    requesterId: string,
    search?: string,
    filters?: {
      orgId?: string;
      status?: string;
    },
  ): Promise<{ invites: Invite[]; total: number }>;

  cancelInvitation(invitationId: string, requesterId: string): Promise<void>;
}
