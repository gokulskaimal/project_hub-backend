import { Document, Model, FilterQuery } from "mongoose";
import { IBaseRepository } from "../interface/repositories/IBaseRepository";
/**
 * Base Repository Abstract Class
 *
 * Provides a generic implementation of common CRUD operations for MongoDB documents
 * using Mongoose. This class serves as a base for all repository implementations
 * in the application, ensuring consistent data access patterns.
 *
 * @template TDomain - The domain entity type
 * @template TDoc - The Mongoose document type extending Document
 */
export declare abstract class BaseRepository<TDomain, TDoc extends Document> implements IBaseRepository<TDomain, string> {
    protected readonly model: Model<TDoc>;
    /**
     * Creates a new BaseRepository instance
     *
     * @param model - The Mongoose model for the document type
     */
    protected constructor(model: Model<TDoc>);
    /**
     * Converts a Mongoose document to a domain entity
     *
     * @param doc - The Mongoose document to convert
     * @returns The domain entity
     */
    protected abstract toDomain(doc: TDoc): TDomain;
    /**
     * Creates a new document in the database
     *
     * @param data - The data to create the document with
     * @returns The created domain entity
     */
    create(data: Partial<TDomain>): Promise<TDomain>;
    /**
     * Finds a document by its ID
     *
     * @param id - The ID of the document to find
     * @returns The found domain entity or null if not found
     */
    findById(id: string): Promise<TDomain | null>;
    /**
     * Finds all documents matching the filter
     *
     * @param filter - The filter to apply to the query
     * @returns An array of domain entities
     */
    findAll(filter?: FilterQuery<TDoc>): Promise<TDomain[]>;
    /**
     * Updates a document by its ID
     *
     * @param id - The ID of the document to update
     * @param data - The data to update the document with
     * @returns The updated domain entity
     * @throws Error if the document is not found
     */
    update(id: string, data: Partial<TDomain>): Promise<TDomain | null>;
    /**
     * Deletes a document by its ID
     *
     * @param id - The ID of the document to delete
     */
    delete(id: string): Promise<boolean>;
    /**
     * Counts documents matching the filter
     *
     * @param filter - The filter to apply to the query
     * @returns The number of matching documents
     */
    count(filter?: FilterQuery<TDoc>): Promise<number>;
    /**
     * Checks if a document exists by its ID
     *
     * @param id - The ID of the document to check
     * @returns True if the document exists, false otherwise
     */
    exists(id: string): Promise<boolean>;
    /**
     * Soft deletes a document by its ID
     * Sets isDeleted flag to true and records deletion time
     *
     * @param id - The ID of the document to soft delete
     */
    softDelete(id: string): Promise<void>;
}
//# sourceMappingURL=BaseRepository.d.ts.map