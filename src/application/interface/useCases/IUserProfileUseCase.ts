/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IUserProfileUseCase {
  /**
   * Get user profile by ID
   */
  getProfile(userId: string): Promise<any>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, updateData: Record<string, any>): Promise<any>;

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
  ): Promise<any[]>;
}
