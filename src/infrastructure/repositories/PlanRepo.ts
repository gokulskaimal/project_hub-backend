import { injectable } from "inversify";
import { BaseRepository } from "./BaseRepo";
import { Plan } from "../../domain/entities/Plan";
import { IPlanRepo } from "../interface/repositories/IPlanRepo";
import PlanModel, { IPlanDoc } from "../models/PlanModel";
import { Model } from "mongoose";

@injectable()
export class PlanRepo
  extends BaseRepository<Plan, IPlanDoc>
  implements IPlanRepo {
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

  async findAll(filter?: Partial<Plan>): Promise<Plan[]> {
    try {
      // If no filter is provided, default to { isActive: true }
      // If filter IS provided (even empty {}), use it.
      // Ideally, the caller should be explicit.
      // But for safety, let's just pass the filter blindly if provided.
      // However, the issue is that arguments defaults only apply if undefined.

      const query = filter === undefined ? { isActive: true } : filter;
      // console.log("PlanRepo.findAll query:", query);
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
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async findByRazorpayId(razorpayPlanId: string): Promise<Plan | null> {
    const doc = await this.model.findOne({ razorpayPlanId });
    return doc ? this.toDomain(doc) : null;
  }
}
