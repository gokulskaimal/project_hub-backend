import { injectable } from "inversify";
import { IOrgRepo } from "../interface/repositories/IOrgRepo";
import {
  Organization,
  OrganizationStatus,
} from "../../domain/entities/Organization";
import OrgModel, { IOrgDOc } from "../models/OrgModel";

@injectable()
export class OrgRepo implements IOrgRepo {
  private toDomain(doc: IOrgDOc): Organization {
    const o = doc.toObject();
    return {
      id: doc.id?.toString() || doc._id?.toString(),
      name: o.name,
      status: (o.status as OrganizationStatus) || OrganizationStatus.ACTIVE,
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
    } as Organization;
  }

  async create(org: Partial<Organization>): Promise<Organization> {
    const created = await OrgModel.create({
      name: org.name,
      status: org.status || OrganizationStatus.ACTIVE,
      createdAt: org.createdAt || new Date(),
      settings: org.settings ?? {
        allowInvitations: true,
        requireEmailVerification: true,
      },
    } as Partial<IOrgDOc>);
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Organization | null> {
    const doc = await OrgModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByName(name: string): Promise<Organization | null> {
    const doc = await OrgModel.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(): Promise<Organization[]> {
    const docs = await OrgModel.find();
    return docs.map((d) => this.toDomain(d));
  }

  async update(
    id: string,
    data: Partial<Organization>,
  ): Promise<Organization | null> {
    const updated = await OrgModel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true },
    );
    return updated ? this.toDomain(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await OrgModel.findByIdAndUpdate(id, {
      status: OrganizationStatus.INACTIVE,
      deletedAt: new Date(),
    });
    return !!result;
  }

  async hardDelete(id: string): Promise<void> {
    await OrgModel.findByIdAndDelete(id);
  }

  async findByStatus(status: string): Promise<Organization[]> {
    const docs = await OrgModel.find({ status });
    return docs.map((d) => this.toDomain(d));
  }

  async findPaginated(
    limit: number,
    offset: number,
    searchTerm?: string,
  ): Promise<{
    organizations: Organization[];
    total: number;
    hasMore: boolean;
  }> {
    const query: Record<string, unknown> = {};
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: "i" };
    }
    const [docs, total] = await Promise.all([
      OrgModel.find(query).skip(offset).limit(limit).sort({ createdAt: -1 }),
      OrgModel.countDocuments(query),
    ]);
    return {
      organizations: docs.map((d) => this.toDomain(d)),
      total,
      hasMore: offset + limit < total,
    };
  }

  async count(): Promise<number> {
    return OrgModel.countDocuments();
  }

  async countByStatus(status: string): Promise<number> {
    return OrgModel.countDocuments({ status });
  }

  async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const query: Record<string, unknown> = {
      name: new RegExp(`^${name.trim()}$`, "i"),
    };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await OrgModel.findOne(query).select("_id");
    return !!exists;
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byStatus: Record<string, number>;
  }> {
    const total = await OrgModel.countDocuments();
    const active = await OrgModel.countDocuments({
      status: OrganizationStatus.ACTIVE,
    });
    const inactive = await OrgModel.countDocuments({
      status: OrganizationStatus.INACTIVE,
    });
    const agg: Array<{ _id: string; count: number }> = await OrgModel.aggregate(
      [{ $group: { _id: "$status", count: { $sum: 1 } } }],
    );
    const byStatus: Record<string, number> = {};
    agg.forEach((s) => {
      byStatus[s._id] = s.count;
    });
    return { total, active, inactive, byStatus };
  }
}
