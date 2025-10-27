"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const inversify_1 = require("inversify");
/**
 * Hash Service Implementation
 * Provides password hashing and verification using bcrypt
 *
 * ✅ DEPENDENCY INVERSION PRINCIPLE:
 * - Implements IHashService interface
 * - Can be easily swapped for testing or different implementations
 * - Uses @injectable decorator for DI container
 */
let HashService = class HashService {
    /**
     * Hash a plain text string (typically a password)
     * @param data - Plain text to hash
     * @param saltRounds - Number of salt rounds (default: 10)
     * @returns Hashed string
     */
    async hash(data, saltRounds = 10) {
        try {
            return await bcrypt_1.default.hash(data, saltRounds);
        }
        catch (error) {
            throw new Error(`Failed to hash data: ${error.message}`);
        }
    }
    /**
     * Compare plain text with hashed string
     * @param data - Plain text to compare
     * @param hash - Hashed string to compare against
     * @returns Whether the data matches the hash
     */
    async compare(data, hash) {
        try {
            return await bcrypt_1.default.compare(data, hash);
        }
        catch (error) {
            throw new Error(`Failed to compare data: ${error.message}`);
        }
    }
    /**
     * Generate salt for hashing
     * @param rounds - Number of salt rounds
     * @returns Generated salt
     */
    async generateSalt(rounds) {
        try {
            return await bcrypt_1.default.genSalt(rounds);
        }
        catch (error) {
            throw new Error(`Failed to generate salt: ${error.message}`);
        }
    }
    /**
     * Get the number of rounds used in a hash
     * @param hash - Hashed string
     * @returns Number of rounds
     */
    getRounds(hash) {
        try {
            return bcrypt_1.default.getRounds(hash);
        }
        catch (error) {
            throw new Error(`Failed to get rounds from hash: ${error.message}`);
        }
    }
    /**
     * Hash data synchronously (use with caution in production)
     * @param data - Plain text to hash
     * @param saltRounds - Number of salt rounds
     * @returns Hashed string
     */
    hashSync(data, saltRounds = 10) {
        try {
            return bcrypt_1.default.hashSync(data, saltRounds);
        }
        catch (error) {
            throw new Error(`Failed to hash data synchronously: ${error.message}`);
        }
    }
    /**
     * Compare data synchronously (use with caution in production)
     * @param data - Plain text to compare
     * @param hash - Hashed string to compare against
     * @returns Whether the data matches the hash
     */
    compareSync(data, hash) {
        try {
            return bcrypt_1.default.compareSync(data, hash);
        }
        catch (error) {
            throw new Error(`Failed to compare data synchronously: ${error.message}`);
        }
    }
};
exports.HashService = HashService;
exports.HashService = HashService = __decorate([
    (0, inversify_1.injectable)()
], HashService);
//# sourceMappingURL=HashService.js.map