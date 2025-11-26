"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteRepo = void 0;
const inversify_1 = require("inversify");
const BaseRepository_1 = require("./BaseRepository");
const InviteModel_1 = __importDefault(require("../models/InviteModel"));
let InviteRepo = class InviteRepo extends BaseRepository_1.BaseRepository {
    constructor() {
        // Cast to unknown first to resolve strict Mongoose type incompatibilities
        super(InviteModel_1.default);
    }
    toDomain(doc) {
        const obj = doc.toObject();
        return {
            id: obj._id.toString(),
            email: obj.email,
            orgId: obj.orgId,
            token: obj.token,
            status: obj.status,
            expiry: obj.expiry,
            assignedRole: obj.role,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt,
            acceptedAt: obj.acceptedAt,
            cancelledAt: obj.cancelledAt,
        };
    }
    async findByToken(token) {
        const doc = await this.model.findOne({ token });
        return doc ? this.toDomain(doc) : null;
    }
    async markAccepted(token) {
        await this.model.findOneAndUpdate({ token }, { status: "ACCEPTED", acceptedAt: new Date() });
    }
    async expire(token) {
        await this.model.findOneAndUpdate({ token }, { status: "EXPIRED", updatedAt: new Date() });
    }
    async findPendingByEmail(email, orgId) {
        const doc = await this.model.findOne({
            email,
            orgId,
            status: "PENDING",
            expiry: { $gt: new Date() }
        });
        return doc ? this.toDomain(doc) : null;
    }
    async findByOrganization(orgId) {
        const docs = await this.model.find({ orgId }).sort({ createdAt: -1 });
        return docs.map(d => this.toDomain(d));
    }
    async findPendingByOrganization(orgId) {
        const docs = await this.model.find({
            orgId,
            status: "PENDING",
            expiry: { $gt: new Date() }
        });
        return docs.map(d => this.toDomain(d));
    }
    async markCancelled(token) {
        await this.model.findOneAndUpdate({ token }, { status: "CANCELLED", cancelledAt: new Date() });
    }
    async expireOldInvitations() {
        const result = await this.model.updateMany({
            status: "PENDING",
            expiry: { $lt: new Date() }
        }, {
            status: "EXPIRED",
            updatedAt: new Date()
        });
        return result.modifiedCount;
    }
    // --- Implemented Missing Interface Methods ---
    async isValidInvitation(token) {
        const doc = await this.model.findOne({ token, status: "PENDING" });
        if (!doc)
            return false;
        if (doc.expiry < new Date()) {
            // It's expired but wasn't marked yet. Mark it now.
            await this.expire(token);
            return false;
        }
        return true;
    }
    async getInvitationStats(orgId) {
        const stats = await this.model.aggregate([
            { $match: { orgId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        // Convert array of {_id: "PENDING", count: 5} to object
        const result = {
            total: 0,
            pending: 0,
            accepted: 0,
            expired: 0,
            cancelled: 0
        };
        stats.forEach(s => {
            const status = s._id.toLowerCase();
            if (status in result) {
                result[status] = s.count;
            }
            result.total += s.count;
        });
        return result;
    }
};
exports.InviteRepo = InviteRepo;
exports.InviteRepo = InviteRepo = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], InviteRepo);
//# sourceMappingURL=InviteRepo.js.map