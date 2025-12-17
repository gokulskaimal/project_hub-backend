"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgRepo = void 0;
const inversify_1 = require("inversify");
const Organization_1 = require("../../domain/entities/Organization");
const OrgModel_1 = __importDefault(require("../models/OrgModel"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
let OrgRepo = class OrgRepo {
    toDomain(doc) {
        const o = doc.toObject();
        return {
            id: doc.id?.toString() || doc._id?.toString(),
            name: o.name,
            status: o.status || Organization_1.OrganizationStatus.ACTIVE,
            createdAt: o.createdAt || new Date(),
            updatedAt: o.updatedAt,
            displayName: o.displayName,
            description: o.description,
            logo: o.logo,
            website: o.website,
            planId: o.planId?.toString(),
            subscriptionStatus: o.subscriptionStatus,
            maxManagers: o.maxManagers,
            maxUsers: o.maxUsers,
            currentUserCount: o.currentUserCount,
            industry: o.industry,
            size: o.size,
            address: o.address,
            contact: o.contact,
            billing: o.billing,
            settings: o.settings,
            features: o.features,
            timezone: o.timezone,
            locale: o.locale,
            createdBy: o.createdBy?.toString(),
            trialStartsAt: o.trialStartsAt,
            trialEndsAt: o.trialEndsAt,
            subscriptionStartsAt: o.subscriptionStartsAt,
            subscriptionEndsAt: o.subscriptionEndsAt,
            lastActivityAt: o.lastActivityAt,
            isDeleted: o.isDeleted,
            deletedAt: o.deletedAt,
            deletionReason: o.deletionReason,
            customFields: o.customFields,
            tags: o.tags,
            priority: o.priority,
            onboardingStatus: o.onboardingStatus,
            integrations: o.integrations,
            usage: o.usage,
            metadata: o.metadata,
        };
    }
    async create(org) {
        const created = await OrgModel_1.default.create({
            name: org.name,
            status: org.status || Organization_1.OrganizationStatus.ACTIVE,
            createdAt: org.createdAt || new Date(),
            settings: org.settings ?? {
                allowInvitations: true,
                requireEmailVerification: true,
            },
        });
        return this.toDomain(created);
    }
    async findById(id) {
        const doc = await OrgModel_1.default.findById(id);
        return doc ? this.toDomain(doc) : null;
    }
    async findByName(name) {
        const doc = await OrgModel_1.default.findOne({
            name: new RegExp(`^${name.trim()}$`, "i"),
        });
        return doc ? this.toDomain(doc) : null;
    }
    async findAll() {
        const docs = await OrgModel_1.default.find();
        return docs.map((d) => this.toDomain(d));
    }
    async update(id, data) {
        const updated = await OrgModel_1.default.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true });
        return updated ? this.toDomain(updated) : null;
    }
    async delete(id) {
        const result = await OrgModel_1.default.findByIdAndUpdate(id, {
            status: Organization_1.OrganizationStatus.INACTIVE,
            deletedAt: new Date(),
        });
        return !!result;
    }
    async hardDelete(id) {
        await OrgModel_1.default.findByIdAndDelete(id);
    }
    async findByStatus(status) {
        const docs = await OrgModel_1.default.find({ status });
        return docs.map((d) => this.toDomain(d));
    }
    async findPaginated(limit, offset, searchTerm) {
        const query = {};
        if (searchTerm) {
            query.name = { $regex: searchTerm, $options: "i" };
        }
        const [docs, total] = await Promise.all([
            OrgModel_1.default.find(query).skip(offset).limit(limit).sort({ createdAt: -1 }),
            OrgModel_1.default.countDocuments(query),
        ]);
        // Aggregate user counts for the fetched organizations
        const orgIds = docs.map((d) => d._id);
        const userCounts = await UserModel_1.default.aggregate([
            { $match: { orgId: { $in: orgIds } } },
            { $group: { _id: "$orgId", count: { $sum: 1 } } },
        ]);
        // Create a map for easy lookup
        const countMap = new Map();
        userCounts.forEach((c) => {
            countMap.set(c._id.toString(), c.count);
        });
        return {
            organizations: docs.map((d) => {
                const org = this.toDomain(d);
                org.currentUserCount = countMap.get(org.id) || 0;
                return org;
            }),
            total,
            hasMore: offset + limit < total,
        };
    }
    async count() {
        return OrgModel_1.default.countDocuments();
    }
    async countByStatus(status) {
        return OrgModel_1.default.countDocuments({ status });
    }
    async nameExists(name, excludeId) {
        const query = {
            name: new RegExp(`^${name.trim()}$`, "i"),
        };
        if (excludeId)
            query._id = { $ne: excludeId };
        const exists = await OrgModel_1.default.findOne(query).select("_id");
        return !!exists;
    }
    async getStats() {
        const total = await OrgModel_1.default.countDocuments();
        const active = await OrgModel_1.default.countDocuments({
            status: Organization_1.OrganizationStatus.ACTIVE,
        });
        const inactive = await OrgModel_1.default.countDocuments({
            status: Organization_1.OrganizationStatus.INACTIVE,
        });
        const agg = await OrgModel_1.default.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
        const byStatus = {};
        agg.forEach((s) => {
            byStatus[s._id] = s.count;
        });
        return { total, active, inactive, byStatus };
    }
};
exports.OrgRepo = OrgRepo;
exports.OrgRepo = OrgRepo = __decorate([
    (0, inversify_1.injectable)()
], OrgRepo);
//# sourceMappingURL=OrgRepo.js.map