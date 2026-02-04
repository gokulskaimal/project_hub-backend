import { BaseRepository } from "./BaseRepo";
import { Plan } from "../../domain/entities/Plan";
import { IPlanRepo } from "../interface/repositories/IPlanRepo";
import { IPlanDoc } from "../models/PlanModel";
export declare class PlanRepo extends BaseRepository<Plan, IPlanDoc> implements IPlanRepo {
    constructor();
    protected toDomain(doc: IPlanDoc): Plan;
    create(data: Partial<Plan>): Promise<Plan>;
    findAll(filter?: Partial<Plan>): Promise<Plan[]>;
    findById(id: string): Promise<Plan | null>;
    update(id: string, plan: Partial<Plan>): Promise<Plan | null>;
    delete(id: string): Promise<boolean>;
    findByRazorpayId(razorpayPlanId: string): Promise<Plan | null>;
}
//# sourceMappingURL=PlanRepo.d.ts.map