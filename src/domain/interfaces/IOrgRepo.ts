import { Organization } from "../entities/Organization";

/**
 * Organization Repository Interface - Enhanced Version
 * Supports all organization operations needed by Use Cases with DI
 */
export interface IOrgRepo {
  /**
   * Create new organization
   * @param org - Partial organization data
   * @returns Created organization
   */
  create(org: Partial<Organization>): Promise<Organization>;

  /**
   * Find organization by ID
   * @param id - Organization ID
   * @returns Organization or null if not found
   */
  findById(id: string): Promise<Organization | null>;

  /**
   * Find organization by name - REQUIRED BY RegisterManagerUseCase
   * @param name - Organization name
   * @returns Organization or null if not found
   */
  findByName(name: string): Promise<Organization | null>;

  /**
   * Find all organizations
   * @returns Array of all organizations
   */
  findAll(): Promise<Organization[]>;

  /**
   * Update organization
   * @param id - Organization ID
   * @param data - Partial organization data to update
   * @returns Updated organization
   */
  update(id: string, data: Partial<Organization>): Promise<Organization>;

  /**
   * Delete organization (soft delete)
   * @param id - Organization ID
   */
  delete(id: string): Promise<void>;

  /**
   * Permanently delete organization
   * @param id - Organization ID
   */
  hardDelete(id: string): Promise<void>;

  /**
   * Find organizations by status
   * @param status - Organization status
   * @returns Array of organizations with the status
   */
  findByStatus(status: string): Promise<Organization[]>;

  /**
   * Find organizations with pagination
   * @param limit - Number of organizations to return
   * @param offset - Number of organizations to skip
   * @param searchTerm - Optional search term
   * @returns Paginated organizations
   */
  findPaginated(
    limit: number,
    offset: number,
    searchTerm?: string,
  ): Promise<{
    organizations: Organization[];
    total: number;
    hasMore: boolean;
  }>;

  /**
   * Count total organizations
   * @returns Total organization count
   */
  count(): Promise<number>;

  /**
   * Count organizations by status
   * @param status - Organization status
   * @returns Organization count
   */
  countByStatus(status: string): Promise<number>;

  /**
   * Check if organization name exists
   * @param name - Organization name to check
   * @param excludeId - Organization ID to exclude from check
   * @returns Whether name exists
   */
  nameExists(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Get organization statistics
   * @returns Organization statistics
   */
  getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byStatus: Record<string, number>;
  }>;
}
