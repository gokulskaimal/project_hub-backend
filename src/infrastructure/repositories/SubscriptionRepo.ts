import { injectable } from "inversify";
import { BaseRepository } from "./BaseRepo";
import { Subscription } from "../../domain/entities/Subscription";
import { ISubscriptionRepo } from "../interface/repositories/ISubscriptionRepo";
import SubscriptionModel, {
  ISubscriptionDoc,
} from "../models/SubscriptionModel";
import { Model } from "mongoose";

@injectable()
export class SubscriptionRepo
  extends BaseRepository<Subscription, ISubscriptionDoc>
  implements ISubscriptionRepo {
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
    const doc = await this.model.findOne({ userId });
    return doc ? this.toDomain(doc) : null;
  }

  async findByRazorpaySubscriptionId(
    razorpaySubscriptionId: string,
  ): Promise<Subscription | null> {
    const doc = await this.model.findOne({ razorpaySubscriptionId });
    return doc ? this.toDomain(doc) : null;
  }

  async update(
    id: string,
    subscription: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const doc = await this.model.findByIdAndUpdate(id, subscription, {
      new: true,
    });
    return doc ? this.toDomain(doc) : null;
  }

  async updateByRazorpayId(
    razorpayId: string,
    subscription: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const doc = await this.model.findOneAndUpdate(
      { razorpaySubscriptionId: razorpayId },
      subscription,
      { new: true },
    );
    return doc ? this.toDomain(doc) : null;
  }
}
