import { Invite } from "../../domain/entities/Invite";

export interface InviteDTO {
  id: string;
  email: string;
  orgId: string;
  status: string;
  expiry: string;
  invitedBy?: string;
  inviterName?: string;
  assignedRole?: string;
  message?: string;
  createdAt: string;
}

export function toInviteDTO(invite: Invite): InviteDTO {
  return {
    id: invite.id,
    email: invite.email,
    orgId: invite.orgId,
    status: invite.status,
    expiry: invite.expiry.toISOString(),
    invitedBy: invite.invitedBy,
    inviterName: invite.inviterName,
    assignedRole: invite.assignedRole,
    message: invite.message,
    createdAt: invite.createdAt.toISOString(),
  };
}
