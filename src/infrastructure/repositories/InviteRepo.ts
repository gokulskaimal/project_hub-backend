import { injectable } from "inversify";
import { IInviteRepo } from "../../domain/interfaces/IInviteRepo";
import { Invite } from "../../domain/entities/Invite";

// ✅ KEEP YOUR EXISTING IN-MEMORY STORAGE
const invites: Invite[] = [];

@injectable()
export class InviteRepo implements IInviteRepo {
  // ✅ KEEP YOUR EXISTING METHODS
  async create(invite: Partial<Invite>): Promise<Invite> {
    const newInvite = {
      ...invite,
      id: Math.random().toString(36).slice(2),
      status: "PENDING",
      createdAt: new Date(),
      expiry: invite.expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    } as Invite;
    invites.push(newInvite);
    return newInvite;
  }

  async findByToken(token: string): Promise<Invite | null> {
    return invites.find((i) => i.token === token) || null;
  }

  async markAccepted(token: string): Promise<void> {
    const invite = invites.find((i) => i.token === token);
    if (invite) {
      invite.status = "ACCEPTED";
      invite.acceptedAt = new Date();
    }
  }

  async expire(token: string): Promise<void> {
    const invite = invites.find((i) => i.token === token);
    if (invite) {
      invite.status = "EXPIRED";
      // ✅ NOTE: Using updatedAt since expiredAt doesn't exist in interface
      invite.updatedAt = new Date();
    }
  }

  // ✅ IMPLEMENT MISSING INTERFACE METHODS WITH CORRECT SIGNATURES

  // ✅ FIX: Interface expects (email: string, orgId: string) => Promise<Invite | null>
  async findPendingByEmail(
    email: string,
    orgId: string,
  ): Promise<Invite | null> {
    return (
      invites.find(
        (invite) =>
          invite.email === email &&
          invite.orgId === orgId &&
          invite.status === "PENDING",
      ) || null
    );
  }

  async findByOrganization(orgId: string): Promise<Invite[]> {
    return invites.filter((invite) => invite.orgId === orgId);
  }

  async findPendingByOrganization(orgId: string): Promise<Invite[]> {
    return invites.filter(
      (invite) => invite.orgId === orgId && invite.status === "PENDING",
    );
  }

  async markCancelled(token: string): Promise<void> {
    const invite = invites.find((i) => i.token === token);
    if (invite) {
      invite.status = "CANCELLED";
      invite.cancelledAt = new Date();
    }
  }

  async expireOldInvitations(): Promise<number> {
    const now = new Date();
    let expiredCount = 0;

    for (const invite of invites) {
      if (invite.status === "PENDING" && invite.expiry && invite.expiry < now) {
        invite.status = "EXPIRED";
        invite.updatedAt = new Date();
        expiredCount++;
      }
    }

    return expiredCount;
  }

  async delete(token: string): Promise<void> {
    const index = invites.findIndex((i) => i.token === token);
    if (index !== -1) {
      invites.splice(index, 1);
    }
  }

  async update(token: string, updateData: Partial<Invite>): Promise<Invite> {
    const invite = invites.find((i) => i.token === token);
    if (!invite) throw new Error("Invite not found");

    Object.assign(invite, updateData, { updatedAt: new Date() });
    return invite;
  }

  async isValidInvitation(token: string): Promise<boolean> {
    const invite = await this.findByToken(token);
    if (!invite) return false;
    if (invite.status !== "PENDING") return false;
    if (invite.expiry && invite.expiry < new Date()) {
      // Auto-expire if expired
      await this.expire(token);
      return false;
    }
    return true;
  }

  async getInvitationStats(orgId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    expired: number;
    cancelled: number;
  }> {
    const orgInvites = invites.filter((i) => i.orgId === orgId);

    return {
      total: orgInvites.length,
      pending: orgInvites.filter((i) => i.status === "PENDING").length,
      accepted: orgInvites.filter((i) => i.status === "ACCEPTED").length,
      expired: orgInvites.filter((i) => i.status === "EXPIRED").length,
      cancelled: orgInvites.filter((i) => i.status === "CANCELLED").length,
    };
  }

  async findAll(): Promise<Invite[]> {
    return [...invites]; // Return a copy
  }

  async findById(id: string): Promise<Invite | null> {
    return invites.find((i) => i.id === id) || null;
  }

  async cleanup(): Promise<number> {
    return await this.expireOldInvitations();
  }

  async count(): Promise<number> {
    return invites.length;
  }

  async findByEmail(email: string): Promise<Invite[]> {
    return invites.filter((invite) => invite.email === email);
  }

  async findByStatus(status: string): Promise<Invite[]> {
    return invites.filter((invite) => invite.status === status);
  }

  async clearAll(): Promise<void> {
    invites.length = 0;
  }

  async performMaintenance(): Promise<void> {
    const cleanedCount = await this.cleanup();
    if (cleanedCount > 0) {
      console.log(
        `🧹 InviteRepo: Cleaned up ${cleanedCount} expired invitations`,
      );
    }
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    accepted: number;
    cancelled: number;
    expired: number;
    byOrg: Record<string, number>;
    byStatus: Record<string, number>;
    lastUpdated: Date;
  }> {
    const stats = {
      total: invites.length,
      pending: invites.filter((invite) => invite.status === "PENDING").length,
      accepted: invites.filter((invite) => invite.status === "ACCEPTED").length,
      cancelled: invites.filter((invite) => invite.status === "CANCELLED")
        .length,
      expired: invites.filter((invite) => invite.status === "EXPIRED").length,
      byOrg: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      lastUpdated: new Date(),
    };

    // Count by organization
    invites.forEach((invite) => {
      const orgId = invite.orgId || "NO_ORG";
      stats.byOrg[orgId] = (stats.byOrg[orgId] || 0) + 1;
    });

    // Count by status
    invites.forEach((invite) => {
      const status = invite.status || "UNKNOWN";
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    return stats;
  }
}
