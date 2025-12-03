import { IOrgRepo } from "../interface/repositories/IOrgRepo";
import { Organization } from "../../domain/entities/Organization";
export declare class OrgRepo implements IOrgRepo {
    private toDomain;
    create(org: Partial<Organization>): Promise<Organization>;
    findById(id: string): Promise<Organization | null>;
    findByName(name: string): Promise<Organization | null>;
    findAll(): Promise<Organization[]>;
    update(id: string, data: Partial<Organization>): Promise<Organization | null>;
    delete(id: string): Promise<boolean>;
    hardDelete(id: string): Promise<void>;
    findByStatus(status: string): Promise<Organization[]>;
    findPaginated(limit: number, offset: number, searchTerm?: string): Promise<{
        organizations: Organization[];
        total: number;
        hasMore: boolean;
    }>;
    count(): Promise<number>;
    countByStatus(status: string): Promise<number>;
    nameExists(name: string, excludeId?: string): Promise<boolean>;
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byStatus: Record<string, number>;
    }>;
}
//# sourceMappingURL=OrgRepo.d.ts.map