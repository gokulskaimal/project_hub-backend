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
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    /**
     * Delete user account (soft delete)
     */
    deleteAccount(userId: string, password: string): Promise<void>;
    /**
     * Get user activity history
     */
    getActivityHistory(userId: string, limit: number, offset: number): Promise<any[]>;
    /**
     * Upload user avatar
     */
    uploadAvatar(userId: string, fileBuffer: Buffer, fileName: string): Promise<string>;
    /**
     * Update user preferences
     */
    updatePreferences(userId: string, preferences: Record<string, any>): Promise<any>;
}
//# sourceMappingURL=IUserProfileUseCase%20.d.ts.map