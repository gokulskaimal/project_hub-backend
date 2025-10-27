import bcrypt from "bcrypt";
import { injectable } from "inversify";
import { IHashService } from "../../domain/interfaces/services/IHashService";

/**
 * Hash Service Implementation
 * Provides password hashing and verification using bcrypt
 *
 * ✅ DEPENDENCY INVERSION PRINCIPLE:
 * - Implements IHashService interface
 * - Can be easily swapped for testing or different implementations
 * - Uses @injectable decorator for DI container
 */
@injectable()
export class HashService implements IHashService {
  /**
   * Hash a plain text string (typically a password)
   * @param data - Plain text to hash
   * @param saltRounds - Number of salt rounds (default: 10)
   * @returns Hashed string
   */
  async hash(data: string, saltRounds: number = 10): Promise<string> {
    try {
      return await bcrypt.hash(data, saltRounds);
    } catch (error) {
      throw new Error(`Failed to hash data: ${(error as Error).message}`);
    }
  }

  /**
   * Compare plain text with hashed string
   * @param data - Plain text to compare
   * @param hash - Hashed string to compare against
   * @returns Whether the data matches the hash
   */
  async compare(data: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(data, hash);
    } catch (error) {
      throw new Error(`Failed to compare data: ${(error as Error).message}`);
    }
  }

  /**
   * Generate salt for hashing
   * @param rounds - Number of salt rounds
   * @returns Generated salt
   */
  async generateSalt(rounds: number): Promise<string> {
    try {
      return await bcrypt.genSalt(rounds);
    } catch (error) {
      throw new Error(`Failed to generate salt: ${(error as Error).message}`);
    }
  }

  /**
   * Get the number of rounds used in a hash
   * @param hash - Hashed string
   * @returns Number of rounds
   */
  getRounds(hash: string): number {
    try {
      return bcrypt.getRounds(hash);
    } catch (error) {
      throw new Error(
        `Failed to get rounds from hash: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Hash data synchronously (use with caution in production)
   * @param data - Plain text to hash
   * @param saltRounds - Number of salt rounds
   * @returns Hashed string
   */
  hashSync(data: string, saltRounds: number = 10): string {
    try {
      return bcrypt.hashSync(data, saltRounds);
    } catch (error) {
      throw new Error(
        `Failed to hash data synchronously: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Compare data synchronously (use with caution in production)
   * @param data - Plain text to compare
   * @param hash - Hashed string to compare against
   * @returns Whether the data matches the hash
   */
  compareSync(data: string, hash: string): boolean {
    try {
      return bcrypt.compareSync(data, hash);
    } catch (error) {
      throw new Error(
        `Failed to compare data synchronously: ${(error as Error).message}`,
      );
    }
  }
}
