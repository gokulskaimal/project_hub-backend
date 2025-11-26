import { BaseRepository } from "./BaseRepository";
import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";
import { Invite } from "../../domain/entities/Invite";
import { Document } from "mongoose";
interface IInviteDoc extends Document {
    email: string;
    orgId: string;
    token: string;
    status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
    expiry: Date;
    role?: string;
    createdAt: Date;
    updatedAt?: Date;
    acceptedAt?: Date;
    cancelledAt?: Date;
}
export declare class InviteRepo extends BaseRepository<Invite, IInviteDoc> implements IInviteRepo {
    constructor();
    protected toDomain(doc: IInviteDoc): Invite;
    findByToken(token: string): Promise<Invite | null>;
    markAccepted(token: string): Promise<void>;
    expire(token: string): Promise<void>;
    findPendingByEmail(email: string, orgId: string): Promise<Invite | null>;
    findByOrganization(orgId: string): Promise<Invite[]>;
    findPendingByOrganization(orgId: string): Promise<Invite[]>;
    markCancelled(token: string): Promise<void>;
    expireOldInvitations(): Promise<number>;
    isValidInvitation(token: string): Promise<boolean>;
    getInvitationStats(orgId: string): Promise<{
        total: number;
        pending: number;
        accepted: number;
        expired: number;
        cancelled: number;
    }>;
}
export {};
//# sourceMappingURL=InviteRepo.d.ts.map