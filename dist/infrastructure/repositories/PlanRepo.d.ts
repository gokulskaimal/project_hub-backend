import { IPlanRepo } from '../../domain/interfaces/IPlanRepo';
import { Plan } from '../../domain/entities/Plan';
export declare class PlanRepo implements IPlanRepo {
    findAll(): Promise<Plan[]>;
    findById(id: string): Promise<Plan | null>;
    create(plan: Partial<Plan>): Promise<Plan>;
}
//# sourceMappingURL=PlanRepo.d.ts.map