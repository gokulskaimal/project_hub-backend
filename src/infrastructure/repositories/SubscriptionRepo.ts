import { injectable } from "inversify";
import { BaseRepository } from "./BaseRepo";
import { Subscription } from "../../domain/entities/Subscription";
import { ISubscriptionRepo } from "../../application/interface/repositories/ISubscriptionRepo";
import SubscriptionModel, {
  ISubscriptionDoc,
} from "../models/SubscriptionModel";
import { Model } from "mongoose";

@injectable()
export class SubscriptionRepo
  extends BaseRepository<Subscription, ISubscriptionDoc>
  implements ISubscriptionRepo
{
  constructor() {
    super(SubscriptionModel as unknown as Model<ISubscriptionDoc>);
  }

  protected toDomain(doc: ISubscriptionDoc): Subscription {
    const obj = doc.toObject();
    return {
      id: obj._id.toString(),
      userId: obj.userId,
      planId: obj.planId,
      razorpaySubscriptionId: obj.razorpaySubscriptionId,
      razorpayCustomerId: obj.razorpayCustomerId,
      status: obj.status,
      currentPeriodStart: obj.currentPeriodStart,
      currentPeriodEnd: obj.currentPeriodEnd,
      cancelAtPeriodEnd: obj.cancelAtPeriodEnd,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    } as Subscription;
  }

  async create(
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
  ): Promise<Subscription> {
    const doc = await this.model.create(subscription);
    return this.toDomain(doc);
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const doc = await this.model.findOne({ userId, isDeleted: { $ne: true } });
    return doc ? this.toDomain(doc) : null;
  }

  async findByRazorpaySubscriptionId(
    razorpaySubscriptionId: string,
  ): Promise<Subscription | null> {
    const doc = await this.model.findOne({
      razorpaySubscriptionId,
      isDeleted: { $ne: true },
    });
    return doc ? this.toDomain(doc) : null;
  }

  async update(
    id: string,
    subscription: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const doc = await this.model.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      subscription,
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async updateByRazorpayId(
    razorpayId: string,
    subscription: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const doc = await this.model.findOneAndUpdate(
      { razorpaySubscriptionId: razorpayId, isDeleted: { $ne: true } },
      subscription,
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.model.updateMany(
      { userId, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
    );
    return result.acknowledged;
  }
}
