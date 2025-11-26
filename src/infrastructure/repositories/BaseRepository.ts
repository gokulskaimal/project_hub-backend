import { Document, Model, FilterQuery } from "mongoose";
import { IBaseRepository } from "../../domain/interfaces/IBaseRepository";

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

export abstract class BaseRepository<TDomain, TDoc extends Document>
  implements IBaseRepository<TDomain, string>
{
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
   * @returns The created domain entity
   */
  async create(data: Partial<TDomain>): Promise<TDomain> {
    // Cast via unknown to avoid unsafe `any` while satisfying Mongoose model typing
    const doc = await this.model.create(data as unknown as Partial<TDoc>);
    return this.toDomain(doc);
  }

  /**
   * Finds a document by its ID
   *
   * @param id - The ID of the document to find
   * @returns The found domain entity or null if not found
   */
  async findById(id: string): Promise<TDomain | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * Finds all documents matching the filter
   *
   * @param filter - The filter to apply to the query
   * @returns An array of domain entities
   */
  async findAll(filter: FilterQuery<TDoc> = {}): Promise<TDomain[]> {
    const docs = await this.model.find(filter);
    return docs.map((d) => this.toDomain(d));
  }

  /**
   * Updates a document by its ID
   *
   * @param id - The ID of the document to update
   * @param data - The data to update the document with
   * @returns The updated domain entity
   * @throws Error if the document is not found
   */
  async update(id: string, data: Partial<TDomain>): Promise<TDomain> {
    // Merge update payload and cast safely for Mongoose
    const updatePayload = {
      ...(data as unknown as Record<string, unknown>),
      updatedAt: new Date(),
    };
    const doc = await this.model.findByIdAndUpdate(
      id,
      updatePayload as unknown as Partial<TDoc>,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!doc) throw new Error("Document not found");
    return this.toDomain(doc);
  }

  /**
   * Deletes a document by its ID
   *
   * @param id - The ID of the document to delete
   */
  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  /**
   * Counts documents matching the filter
   *
   * @param filter - The filter to apply to the query
   * @returns The number of matching documents
   */
  async count(filter: FilterQuery<TDoc> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  /**
   * Checks if a document exists by its ID
   *
   * @param id - The ID of the document to check
   * @returns True if the document exists, false otherwise
   */
  async exists(id: string): Promise<boolean> {
    return !!(await this.model.findById(id));
  }

  /**
   * Soft deletes a document by its ID
   * Sets isDeleted flag to true and records deletion time
   *
   * @param id - The ID of the document to soft delete
   */
  async softDelete(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }
}
