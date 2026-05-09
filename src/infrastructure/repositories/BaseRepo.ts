import { Document, Model, FilterQuery, ClientSession } from "mongoose";
import { IBaseRepository } from "../../application/interface/repositories/IBaseRepo";

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

export abstract class BaseRepository<
  TDomain,
  TDoc extends Document,
> implements IBaseRepository<TDomain, string> {
  /**
   * Creates a new BaseRepository instance
   *
   * @param model - The Mongoose model for the document type
   */
  protected constructor(protected readonly model: Model<TDoc>) {}

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
   * @param session - Optional database transaction session
   * @returns The created domain entity
   */
  async create(
    data: Partial<TDomain>,
    session?: ClientSession,
  ): Promise<TDomain> {
    // Cast via unknown is necessary here because TDomain (Entity) and TDoc (Mongoose Document)
    // are structurally different types in TypeScript, even though they map to the same data.
    const doc = await this.model.create([data as unknown as Partial<TDoc>], {
      session,
    });
    return this.toDomain(doc[0]);
  }

  /**
   * Finds a document by its ID
   *
   * @param id - The ID of the document to find
   * @returns The found domain entity or null if not found
   */
  async findById(id: string): Promise<TDomain | null> {
    const doc = await this.model.findOne({
      _id: id,
      isDeleted: { $ne: true },
    } as FilterQuery<TDoc>);
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Finds all documents matching the filter
   *
   * @param filter - The filter to apply to the query
   * @returns An array of domain entities
   */
  async findAll(filter: FilterQuery<TDoc> = {}): Promise<TDomain[]> {
    const finalFilter = {
      ...filter,
      isDeleted: { $ne: true },
    } as FilterQuery<TDoc>;
    const docs = await this.model.find(finalFilter);
    return docs.map((d) => this.toDomain(d));
  }

  /**
   * Updates a document by its ID
   *
   * @param id - The ID of the document to update
   * @param data - The data to update the document with
   * @param session - Optional database transaction session
   * @returns The updated domain entity
   * @throws Error if the document is not found
   */
  async update(
    id: string,
    data: Partial<TDomain>,
    session?: ClientSession,
  ): Promise<TDomain | null> {
    // Merge update payload and cast safely for Mongoose
    // We treat 'data' as a generic record to merge it with 'updatedAt'
    const updatePayload = {
      ...(data as unknown as Record<string, unknown>),
      updatedAt: new Date(),
    };

    const doc = await this.model.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } } as FilterQuery<TDoc>,
      updatePayload as unknown as Partial<TDoc>,
      {
        new: true,
        runValidators: true,
        session,
      },
    );
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Deletes a document by its ID
   *
   * @param id - The ID of the document to delete
   * @param session - Optional database transaction session
   */
  async delete(id: string, session?: ClientSession): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { session },
    );
    return !!result;
  }

  /**
   * Deletes multiple documents matching a filter
   * @param filter - The Mongoose filter query
   * @param session - Optional database transaction session
   */
  async deleteMany(
    filter: FilterQuery<TDomain>,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.model.updateMany(
      filter,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { session },
    );
    return result.acknowledged;
  }

  /**
   * Counts documents matching the filter
   *
   * @param filter - The filter to apply to the query
   * @returns The number of matching documents
   */
  async count(filter: FilterQuery<TDoc> = {}): Promise<number> {
    const finalFilter = {
      ...filter,
      isDeleted: { $ne: true },
    } as FilterQuery<TDoc>;
    return this.model.countDocuments(finalFilter);
  }

  /**
   * Checks if a document exists by its ID
   *
   * @param id - The ID of the document to check
   * @returns True if the document exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    return !!(await this.model.findOne({
      _id: id,
      isDeleted: { $ne: true },
    } as FilterQuery<TDoc>));
  }

  /**
   * Soft deletes a document by its ID.
   * Convenience alias for delete() — kept for semantic clarity at call sites.
   * Sets isDeleted flag to true and records deletion time.
   *
   * @param id - The ID of the document to soft delete
   * @param session - Optional database transaction session
   */
  async softDelete(id: string, session?: ClientSession): Promise<void> {
    await this.delete(id, session);
  }
}
