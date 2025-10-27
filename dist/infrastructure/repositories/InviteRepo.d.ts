import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";
import { Invite } from "../../domain/entities/Invite";
export declare class InviteRepo implements IInviteRepo {
    create(invite: Partial<Invite>): Promise<Invite>;
    findByToken(token: string): Promise<Invite | null>;
    markAccepted(token: string): Promise<void>;
    expire(token: string): Promise<void>;
    findPendingByEmail(email: string, orgId: string): Promise<Invite | null>;
    findByOrganization(orgId: string): Promise<Invite[]>;
    findPendingByOrganization(orgId: string): Promise<Invite[]>;
    markCancelled(token: string): Promise<void>;
    expireOldInvitations(): Promise<number>;
    delete(token: string): Promise<void>;
    update(token: string, updateData: Partial<Invite>): Promise<Invite>;
    isValidInvitation(token: string): Promise<boolean>;
    getInvitationStats(orgId: string): Promise<{
        total: number;
        pending: number;
        accepted: number;
        expired: number;
        cancelled: number;
    }>;
    findAll(): Promise<Invite[]>;
    findById(id: string): Promise<Invite | null>;
    cleanup(): Promise<number>;
    count(): Promise<number>;
    findByEmail(email: string): Promise<Invite[]>;
    findByStatus(status: string): Promise<Invite[]>;
    clearAll(): Promise<void>;
    performMaintenance(): Promise<void>;
    getStats(): Promise<{
        total: number;
        pending: number;
        accepted: number;
        cancelled: number;
        expired: number;
        byOrg: Record<string, number>;
        byStatus: Record<string, number>;
        lastUpdated: Date;
    }>;
}
//# sourceMappingURL=InviteRepo.d.ts.map