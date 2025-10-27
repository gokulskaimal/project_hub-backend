export interface IHashService {
  /**
   * Hash a password or string
   * @param data - Data to hash
   * @param saltRounds - Number of salt rounds (optional)
   * @returns Hashed string
   */
  hash(data: string, saltRounds?: number): Promise<string>;

  /**
   * Compare plain text with hash
   * @param data - Plain text data
   * @param hash - Hashed data to compare against
   * @returns Whether data matches hash
   */
  compare(data: string, hash: string): Promise<boolean>;

  /**
   * Generate salt
   * @param rounds - Number of rounds
   * @returns Generated salt
   */
  generateSalt(rounds: number): Promise<string>;
}
