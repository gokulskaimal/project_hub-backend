import { injectable } from "inversify";
import { BaseRepository } from "./BaseRepository";
import { Plan } from "../../domain/entities/Plan";
import { IPlanRepo } from "../interface/repositories/IPlanRepo";
import PlanModel, { IPlanDoc } from "../models/PlanModel";
import { Model } from "mongoose";

@injectable()
export class PlanRepo
  extends BaseRepository<Plan, IPlanDoc>
  implements IPlanRepo
{
  constructor() {
    super(PlanModel as unknown as Model<IPlanDoc>);
  }

  protected toDomain(doc: IPlanDoc): Plan {
    const obj = doc.toObject();
    return {
      id: obj._id.toString(),
      name: obj.name,
      description: obj.description,
      price: obj.price,
      currency: obj.currency,
      features: obj.features,
      type: obj.type,
      isActive: obj.isActive,
      razorpayPlanId: obj.razorpayPlanId,
      limits: obj.limits,
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
    } as Plan;
  }

  async create(data: Partial<Plan>): Promise<Plan> {
    const doc = await this.model.create(data);
    return this.toDomain(doc);
  }

  async findAll(filter: Partial<Plan> = { isActive: true }): Promise<Plan[]> {
    const docs = await this.model.find(filter);
    return docs.map((d) => this.toDomain(d));
  }

  async findById(id: string): Promise<Plan | null> {
    const docs = await this.model.findById(id);
    return docs ? this.toDomain(docs) : null;
  }

  async update(id: string, plan: Partial<Plan>): Promise<Plan | null> {
    const doc = await this.model.findByIdAndUpdate(id, plan, { new: true });
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async findByRazorpayId(razorpayPlanId: string): Promise<Plan | null> {
    const doc = await this.model.findOne({ razorpayPlanId });
    return doc ? this.toDomain(doc) : null;
  }
}
