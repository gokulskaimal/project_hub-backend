import { UserDTO, UpdateProfileRequestDTO } from "../../dto/UserDTO";

export interface IUserProfileUseCase {
  /**
   * Get user profile by ID
   */
  getProfile(userId: string): Promise<UserDTO>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, updateData: UpdateProfileRequestDTO): Promise<UserDTO>;

  /**
   * Change user password
   */
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;

  /**
   * Delete user account (soft delete)
   */
  deleteAccount(userId: string, password: string): Promise<void>;

  /**
   * Get user activity history
   */
  getActivityHistory(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Record<string, unknown>[]>;
}
