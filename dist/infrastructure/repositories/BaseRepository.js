"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
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
class BaseRepository {
    /**
     * Creates a new BaseRepository instance
     *
     * @param model - The Mongoose model for the document type
     */
    constructor(model) {
        this.model = model;
    }
    /**
     * Creates a new document in the database
     *
     * @param data - The data to create the document with
     * @returns The created domain entity
     */
    async create(data) {
        const doc = await this.model.create(data);
        return this.toDomain(doc);
    }
    /**
     * Finds a document by its ID
     *
     * @param id - The ID of the document to find
     * @returns The found domain entity or null if not found
     */
    async findById(id) {
        const doc = await this.model.findById(id);
        return doc ? this.toDomain(doc) : null;
    }
    /**
     * Finds all documents matching the filter
     *
     * @param filter - The filter to apply to the query
     * @returns An array of domain entities
     */
    async findAll(filter = {}) {
        const docs = await this.model.find(filter);
        return docs.map(d => this.toDomain(d));
    }
    /**
     * Updates a document by its ID
     *
     * @param id - The ID of the document to update
     * @param data - The data to update the document with
     * @returns The updated domain entity
     * @throws Error if the document is not found
     */
    async update(id, data) {
        const doc = await this.model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!doc)
            throw new Error('Document not found');
        return this.toDomain(doc);
    }
    /**
     * Deletes a document by its ID
     *
     * @param id - The ID of the document to delete
     */
    async delete(id) {
        await this.model.findByIdAndDelete(id);
    }
    /**
     * Counts documents matching the filter
     *
     * @param filter - The filter to apply to the query
     * @returns The number of matching documents
     */
    async count(filter = {}) {
        return this.model.countDocuments(filter);
    }
    /**
     * Checks if a document exists by its ID
     *
     * @param id - The ID of the document to check
     * @returns True if the document exists, false otherwise
     */
    async exists(id) {
        return !!(await this.model.findById(id));
    }
    /**
     * Soft deletes a document by its ID
     * Sets isDeleted flag to true and records deletion time
     *
     * @param id - The ID of the document to soft delete
     */
    async softDelete(id) {
        await this.model.findByIdAndUpdate(id, {
            isDeleted: true,
            deletedAt: new Date(),
        });
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map