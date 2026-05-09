export interface Invite {
  id: string;

  email: string;

  orgId: string;

  token: string;

  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

  expiry: Date;

  invitedBy?: string;

  inviterName?: string;

  assignedRole?: string;

  message?: string;

  resendCount?: number;

  lastSentAt?: Date;

  acceptedAt?: Date;

  cancelledAt?: Date;

  cancellationReason?: string;

  createdAt: Date;

  updatedAt?: Date;

  isDeleted?: boolean;

  deletedAt?: Date | null;

  metadata?: Record<string, unknown>;

  createdFromIp?: string;

  createdFromUserAgent?: string;
}
