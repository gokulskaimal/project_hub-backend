"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteRepo = void 0;
const inversify_1 = require("inversify");
// ✅ KEEP YOUR EXISTING IN-MEMORY STORAGE
const invites = [];
let InviteRepo = class InviteRepo {
    // ✅ KEEP YOUR EXISTING METHODS
    async create(invite) {
        const newInvite = {
            ...invite,
            id: Math.random().toString(36).slice(2),
            status: "PENDING",
            createdAt: new Date(),
            expiry: invite.expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
        };
        invites.push(newInvite);
        return newInvite;
    }
    async findByToken(token) {
        return invites.find((i) => i.token === token) || null;
    }
    async markAccepted(token) {
        const invite = invites.find((i) => i.token === token);
        if (invite) {
            invite.status = "ACCEPTED";
            invite.acceptedAt = new Date();
        }
    }
    async expire(token) {
        const invite = invites.find((i) => i.token === token);
        if (invite) {
            invite.status = "EXPIRED";
            // ✅ NOTE: Using updatedAt since expiredAt doesn't exist in interface
            invite.updatedAt = new Date();
        }
    }
    // ✅ IMPLEMENT MISSING INTERFACE METHODS WITH CORRECT SIGNATURES
    // ✅ FIX: Interface expects (email: string, orgId: string) => Promise<Invite | null>
    async findPendingByEmail(email, orgId) {
        return (invites.find((invite) => invite.email === email &&
            invite.orgId === orgId &&
            invite.status === "PENDING") || null);
    }
    async findByOrganization(orgId) {
        return invites.filter((invite) => invite.orgId === orgId);
    }
    async findPendingByOrganization(orgId) {
        return invites.filter((invite) => invite.orgId === orgId && invite.status === "PENDING");
    }
    async markCancelled(token) {
        const invite = invites.find((i) => i.token === token);
        if (invite) {
            invite.status = "CANCELLED";
            invite.cancelledAt = new Date();
        }
    }
    async expireOldInvitations() {
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
    async delete(token) {
        const index = invites.findIndex((i) => i.token === token);
        if (index !== -1) {
            invites.splice(index, 1);
        }
    }
    async update(token, updateData) {
        const invite = invites.find((i) => i.token === token);
        if (!invite)
            throw new Error("Invite not found");
        Object.assign(invite, updateData, { updatedAt: new Date() });
        return invite;
    }
    async isValidInvitation(token) {
        const invite = await this.findByToken(token);
        if (!invite)
            return false;
        if (invite.status !== "PENDING")
            return false;
        if (invite.expiry && invite.expiry < new Date()) {
            // Auto-expire if expired
            await this.expire(token);
            return false;
        }
        return true;
    }
    async getInvitationStats(orgId) {
        const orgInvites = invites.filter((i) => i.orgId === orgId);
        return {
            total: orgInvites.length,
            pending: orgInvites.filter((i) => i.status === "PENDING").length,
            accepted: orgInvites.filter((i) => i.status === "ACCEPTED").length,
            expired: orgInvites.filter((i) => i.status === "EXPIRED").length,
            cancelled: orgInvites.filter((i) => i.status === "CANCELLED").length,
        };
    }
    async findAll() {
        return [...invites]; // Return a copy
    }
    async findById(id) {
        return invites.find((i) => i.id === id) || null;
    }
    async cleanup() {
        return await this.expireOldInvitations();
    }
    async count() {
        return invites.length;
    }
    async findByEmail(email) {
        return invites.filter((invite) => invite.email === email);
    }
    async findByStatus(status) {
        return invites.filter((invite) => invite.status === status);
    }
    async clearAll() {
        invites.length = 0;
    }
    async performMaintenance() {
        const cleanedCount = await this.cleanup();
        if (cleanedCount > 0) {
            console.log(`🧹 InviteRepo: Cleaned up ${cleanedCount} expired invitations`);
        }
    }
    async getStats() {
        const stats = {
            total: invites.length,
            pending: invites.filter((invite) => invite.status === "PENDING").length,
            accepted: invites.filter((invite) => invite.status === "ACCEPTED").length,
            cancelled: invites.filter((invite) => invite.status === "CANCELLED")
                .length,
            expired: invites.filter((invite) => invite.status === "EXPIRED").length,
            byOrg: {},
            byStatus: {},
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
};
exports.InviteRepo = InviteRepo;
exports.InviteRepo = InviteRepo = __decorate([
    (0, inversify_1.injectable)()
], InviteRepo);
//# sourceMappingURL=InviteRepo.js.map