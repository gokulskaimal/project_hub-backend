import { injectable } from "inversify";
import { BaseRepository } from "./BaseRepo";
import { Plan } from "../../domain/entities/Plan";
import { IPlanRepo } from "../../application/interface/repositories/IPlanRepo";
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
      id: String(obj._id),
      name: obj.name,
      description: obj.description,
      price: obj.price,
      currency: obj.currency,
      duration: obj.duration,
      isActive: obj.isActive,
      razorpayPlanId: obj.razorpayPlanId,
      type: obj.type,
      limits: {
        projects: obj.limits?.projects || 0,
        members: obj.limits?.members || 0,
        storage: obj.limits?.storage || 0,
        messages: obj.limits?.messages || 0,
        sprints: obj.limits?.sprints || 0,
      },
      features: obj.features || [],
      createdAt: new Date(obj.createdAt || Date.now()),
      updatedAt: new Date(obj.updatedAt || Date.now()),
    } as Plan;
  }

  async create(data: Partial<Plan>): Promise<Plan> {
    const doc = await this.model.create(data);
    return this.toDomain(doc);
  }

  async findAll(filter?: Partial<Plan>): Promise<Plan[]> {
    try {
      const query = filter === undefined ? { isActive: true } : filter;
      const docs = await this.model.find(query);
      return docs.map((d) => this.toDomain(d));
    } catch (error) {
      console.error("PlanRepo.findAll failed:", error);
      throw error;
    }
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
    const result = await this.model.findByIdAndUpdate(id, { isActive: false });
    return !!result;
  }

  async findByRazorpayId(razorpayPlanId: string): Promise<Plan | null> {
    const doc = await this.model.findOne({ razorpayPlanId });
    return doc ? this.toDomain(doc) : null;
  }
}
