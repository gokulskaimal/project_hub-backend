import { UserDTO, UpdateProfileRequestDTO } from "../../dto/UserDTO";

export interface IUserProfileUseCase {
  /**
   * Get user profile by ID
   */
  getProfile(userId: string, requesterId: string): Promise<UserDTO>;

  /**
   * Update user profile
   */
  updateProfile(
    userId: string,
    updateData: UpdateProfileRequestDTO,
    requesterId: string,
  ): Promise<UserDTO>;

  /**
   * Change user password
   */
  changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    requesterId: string,
  ): Promise<void>;

  /**
   * Delete user account (soft delete)
   */
  deleteAccount(
    userId: string,
    password: string,
    requesterId: string,
  ): Promise<void>;

  /**
   * Get user activity history
   */
  getActivityHistory(
    userId: string,
    limit: number,
    offset: number,
    requesterId: string,
  ): Promise<Record<string, unknown>[]>;
}
