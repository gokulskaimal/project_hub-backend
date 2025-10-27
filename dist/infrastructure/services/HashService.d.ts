import { IHashService } from '../../domain/interfaces/services/IHashService ';
/**
 * Hash Service Implementation
 * Provides password hashing and verification using bcrypt
 *
 * ✅ DEPENDENCY INVERSION PRINCIPLE:
 * - Implements IHashService interface
 * - Can be easily swapped for testing or different implementations
 * - Uses @injectable decorator for DI container
 */
export declare class HashService implements IHashService {
    /**
     * Hash a plain text string (typically a password)
     * @param data - Plain text to hash
     * @param saltRounds - Number of salt rounds (default: 10)
     * @returns Hashed string
     */
    hash(data: string, saltRounds?: number): Promise<string>;
    /**
     * Compare plain text with hashed string
     * @param data - Plain text to compare
     * @param hash - Hashed string to compare against
     * @returns Whether the data matches the hash
     */
    compare(data: string, hash: string): Promise<boolean>;
    /**
     * Generate salt for hashing
     * @param rounds - Number of salt rounds
     * @returns Generated salt
     */
    generateSalt(rounds: number): Promise<string>;
    /**
     * Get the number of rounds used in a hash
     * @param hash - Hashed string
     * @returns Number of rounds
     */
    getRounds(hash: string): number;
    /**
     * Hash data synchronously (use with caution in production)
     * @param data - Plain text to hash
     * @param saltRounds - Number of salt rounds
     * @returns Hashed string
     */
    hashSync(data: string, saltRounds?: number): string;
    /**
     * Compare data synchronously (use with caution in production)
     * @param data - Plain text to compare
     * @param hash - Hashed string to compare against
     * @returns Whether the data matches the hash
     */
    compareSync(data: string, hash: string): boolean;
}
//# sourceMappingURL=HashService.d.ts.map