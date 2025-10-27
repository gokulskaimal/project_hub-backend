export interface Invite {
    id: string;
    email: string;
    orgId: string;
    token: string;
    status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
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
    metadata?: Record<string, any>;
    createdFromIp?: string;
    createdFromUserAgent?: string;
}
//# sourceMappingURL=Invite.d.ts.map