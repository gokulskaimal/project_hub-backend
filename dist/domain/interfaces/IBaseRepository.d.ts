import { FilterQuery } from "mongoose";
/**
 * Base Repository Interface
 *
 * Defines the contract for repository implementations providing CRUD operations
 * This interface ensures consistent data access patterns across the application
 *
 * @template T - The domain entity type
 * @template ID - The type of the entity's identifier (defaults to string)
 */
export interface IBaseRepository<T, ID = string> {
    /**
     * Creates a new entity
     *
     * @param data - The data to create the entity with
     * @returns A promise resolving to the created entity
     */
    create(data: Partial<T>): Promise<T>;
    /**
     * Finds an entity by its ID
     *
     * @param id - The ID of the entity to find
     * @returns A promise resolving to the found entity or null if not found
     */
    findById(id: ID): Promise<T | null>;
    /**
     * Finds all entities matching the filter
     *
     * @param filter - The filter to apply to the query
     * @returns A promise resolving to an array of entities
     */
    findAll(filter?: FilterQuery<T>): Promise<T[]>;
    /**
     * Updates an entity by its ID
     *
     * @param id - The ID of the entity to update
     * @param data - The data to update the entity with
     * @returns A promise resolving to the updated entity
     */
    update(id: ID, data: Partial<T>): Promise<T>;
    /**
     * Deletes an entity by its ID
     *
     * @param id - The ID of the entity to delete
     * @returns A promise that resolves when the entity is deleted
     */
    delete(id: ID): Promise<void>;
    /**
     * Counts entities matching the filter
     *
     * @param filter - The filter to apply to the query
     * @returns A promise resolving to the count of matching entities
     */
    count(filter?: FilterQuery<T>): Promise<number>;
    /**
     * Checks if an entity exists by its ID
     *
     * @param id - The ID of the entity to check
     * @returns A promise resolving to true if the entity exists, false otherwise
     */
    exists(id: ID): Promise<boolean>;
    /**
     * Soft deletes an entity by its ID
     * Sets isDeleted flag to true and records deletion time
     *
     * @param id - The ID of the entity to soft delete
     * @returns A promise that resolves when the entity is soft deleted
     */
    softDelete(id: ID): Promise<void>;
}
//# sourceMappingURL=IBaseRepository.d.ts.map