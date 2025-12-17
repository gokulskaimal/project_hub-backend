import { injectable } from "inversify";
import { BaseRepository } from "./BaseRepo";
import { IInviteRepo } from "../interface/repositories/IInviteRepo";
import { Invite } from "../../domain/entities/Invite";
import InviteModel from "../models/InviteModel";
import { Document, Model } from "mongoose";

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

@injectable()
export class InviteRepo
  extends BaseRepository<Invite, IInviteDoc>
  implements IInviteRepo {
  constructor() {
    // Cast to unknown first to resolve strict Mongoose type incompatibilities
    super(InviteModel as unknown as Model<IInviteDoc>);
  }

  protected toDomain(doc: IInviteDoc): Invite {
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
    } as Invite;
  }

  async findByToken(token: string): Promise<Invite | null> {
    const doc = await this.model.findOne({ token });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(token: string): Promise<boolean> {
    const result = await this.model.findOneAndDelete({ token });
    return !!result;
  }

  async markAccepted(token: string): Promise<void> {
    await this.model.findOneAndUpdate(
      { token },
      { status: "ACCEPTED", acceptedAt: new Date() },
    );
  }

  async expire(token: string): Promise<void> {
    await this.model.findOneAndUpdate(
      { token },
      { status: "EXPIRED", updatedAt: new Date() },
    );
  }

  async findPendingByEmail(
    email: string,
    orgId: string,
  ): Promise<Invite | null> {
    const doc = await this.model.findOne({
      email,
      orgId,
      status: "PENDING",
      expiry: { $gt: new Date() },
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findByOrganization(orgId: string): Promise<Invite[]> {
    const docs = await this.model.find({ orgId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDomain(d));
  }

  async findPendingByOrganization(orgId: string): Promise<Invite[]> {
    const docs = await this.model.find({
      orgId,
      status: "PENDING",
      expiry: { $gt: new Date() },
    });
    return docs.map((d) => this.toDomain(d));
  }

  async markCancelled(token: string): Promise<void> {
    await this.model.findOneAndUpdate(
      { token },
      { status: "CANCELLED", cancelledAt: new Date() },
    );
  }

  async markCancelledById(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      status: "CANCELLED",
      cancelledAt: new Date(),
    });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async deleteByOrganization(orgId: string): Promise<number> {
    const result = await this.model.deleteMany({ orgId });
    return result.deletedCount;
  }

  async expireOldInvitations(): Promise<number> {
    const result = await this.model.updateMany(
      {
        status: "PENDING",
        expiry: { $lt: new Date() },
      },
      {
        status: "EXPIRED",
        updatedAt: new Date(),
      },
    );
    return result.modifiedCount;
  }

  // --- Implemented Missing Interface Methods ---

  async isValidInvitation(token: string): Promise<boolean> {
    const doc = await this.model.findOne({ token, status: "PENDING" });
    if (!doc) return false;

    if (doc.expiry < new Date()) {
      // It's expired but wasn't marked yet. Mark it now.
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
    const stats = await this.model.aggregate([
      { $match: { orgId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert array of {_id: "PENDING", count: 5} to object
    const result = {
      total: 0,
      pending: 0,
      accepted: 0,
      expired: 0,
      cancelled: 0,
    };

    stats.forEach((s) => {
      const status = s._id.toLowerCase() as keyof typeof result;
      if (status in result) {
        result[status] = s.count;
      }
      result.total += s.count;
    });

    return result;
  }
}
