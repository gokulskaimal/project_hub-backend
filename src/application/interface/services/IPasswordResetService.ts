import { User } from "../../../domain/entities/User";

export interface IPasswordResetService {
  /**
   * Set reset token for a user
   */
  setResetToken(email: string, token: string, expiry: Date): Promise<void>;

  /**
   * Find user by reset token
   */
  findByToken(token: string): Promise<User | null>;

  /**
   * Clear reset token for a user
   */
  clearResetToken(id: string): Promise<void>;

  /**
   * Update password for a user
   */
  updatePassword(id: string, passwordHash: string): Promise<void>;
}
