import { IOrgRepo } from '../../domain/interfaces/IOrgRepo';
import { Organization } from '../../domain/entities/Organization';
export declare class OrgRepo implements IOrgRepo {
    private organizations;
    private nextId;
    create(org: Partial<Organization>): Promise<Organization>;
    findById(id: string): Promise<Organization | null>;
    findByName(name: string): Promise<Organization | null>;
    findAll(): Promise<Organization[]>;
    update(id: string, data: Partial<Organization>): Promise<Organization>;
    delete(id: string): Promise<void>;
    /**
     * ✅ ADDED: Hard delete - REQUIRED BY INTERFACE
     */
    hardDelete(id: string): Promise<void>;
    /**
     * ✅ ADDED: Find by status - REQUIRED BY INTERFACE
     */
    findByStatus(status: string): Promise<Organization[]>;
    findPaginated(limit: number, offset: number, searchTerm?: string): Promise<{
        organizations: Organization[];
        total: number;
        hasMore: boolean;
    }>;
    count(): Promise<number>;
    /**
     * ✅ FIXED: Count by specific status - MATCHES INTERFACE SIGNATURE
     */
    countByStatus(status: string): Promise<number>;
    nameExists(name: string, excludeId?: string): Promise<boolean>;
    /**
     * ✅ FIXED: Get stats - MATCHES INTERFACE SIGNATURE
     */
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byStatus: Record<string, number>;
    }>;
}
//# sourceMappingURL=OrgRepo.d.ts.map