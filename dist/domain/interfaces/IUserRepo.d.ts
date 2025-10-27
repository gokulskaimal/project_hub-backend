import { User } from "../entities/User";
/**
 * User Repository Interface
 */
export interface IUserRepo {
    /**
     * Create new user
     * @param user - Partial user data
     * @returns Created user
     */
    create(user: Partial<User>): Promise<User>;
    /**
     * Find user by email
     * @param email - User email
     * @returns User or null if not found
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * Find user by ID
     * @param id - User ID
     * @returns User or null if not found
     */
    findById(id: string): Promise<User | null>;
    /**
     * Find users by organization ID
     * @param orgId - Organization ID
     * @returns Array of users in the organization
     */
    findByOrg(orgId: string): Promise<User[]>;
    /**
     * Find all users
     * @returns Array of all users
     */
    findAll(): Promise<User[]>;
    /**
     * Find users by role
     * @param role - User role
     * @returns Array of users with the role
     */
    findByRole(role: string): Promise<User[]>;
    /**
     * Find users by organization and role
     * @param orgId - Organization ID
     * @param role - User role
     * @returns Array of users
     */
    findByOrgAndRole(orgId: string, role: string): Promise<User[]>;
    /**
     *Update user
     * @param id - User ID
     * @param data - Partial user data to update
     * @returns Updated user
     */
    update(id: string, data: Partial<User>): Promise<User>;
    /**
     * Update user password
     * @param id - User ID
     * @param hashedPassword - Hashed password
     */
    updatePassword(id: string, hashedPassword: string): Promise<void>;
    /**
     * Set password reset token
     * @param email - User email
     * @param token - Reset token
     * @param expires - Token expiration date
     */
    setResetPasswordToken(email: string, token: string, expires: Date): Promise<void>;
    /**
     * Clear password reset token
     * @param id - User ID
     */
    clearResetPasswordToken(id: string): Promise<void>;
    /**
     * Find user by reset token
     * @param token - Reset token
     * @returns User or null if not found
     */
    findByResetToken(token: string): Promise<User | null>;
    /**
     * Verify user email
     * @param id - User ID
     */
    verifyEmail(id: string): Promise<void>;
    /**
     * Update user profile
     * @param id - User ID
     * @param data - Partial user data to update
     * @returns Updated user
     */
    updateProfile(id: string, data: Partial<User>): Promise<User>;
    /**
     * Update user status
     * @param id - User ID
     * @param status - New status
     * @returns Updated user
     */
    updateStatus(id: string, status: string): Promise<User>;
    /**
     * Save OTP for user
     * @param email - User email
     * @param otp - OTP code
     * @param expiry - OTP expiration date
     */
    saveOtp(email: string, otp: string, expiry: Date): Promise<void>;
    /**
     * ✅ ADDED: Store OTP (alias for saveOtp) - REQUIRED BY SendOtpUseCase
     * @param email - User email
     * @param otp - OTP code
     * @param expiry - OTP expiration date
     */
    storeOtp(email: string, otp: string, expiry: Date): Promise<void>;
    /**
     * ✅ ADDED: Get OTP details - REQUIRED BY SendOtpUseCase
     * @param email - User email
     * @returns OTP details or null
     */
    getOtp(email: string): Promise<{
        otp: string;
        expiresAt: Date;
    } | null>;
    /**
     * Verify OTP for user
     * @param email - User email
     * @param otp - OTP code
     * @returns User if OTP is valid, null otherwise
     */
    verifyOtp(email: string, otp: string): Promise<User | null>;
    /**
     * Delete user (soft delete)
     * @param id - User ID
     */
    delete(id: string): Promise<void>;
    /**
     * Permanently delete user
     * @param id - User ID
     */
    hardDelete(id: string): Promise<void>;
    /**
     * Ensure user exists with OTP (create if not exists, update if exists)
     * @param email - User email
     * @param otp - OTP code
     * @param expiry - OTP expiration date
     * @returns User with OTP
     */
    ensureUserWithOtp(email: string, otp: string, expiry: Date): Promise<User>;
    /**
     * Remove user from organization
     * @param userId - User ID
     * @param orgId - Organization ID
     */
    removeFromOrg(userId: string, orgId: string): Promise<void>;
    /**
     * ✅ ADDED: Find organization by ID - REQUIRED BY AcceptUseCase
     * @param orgId - Organization ID
     * @returns Organization or null
     */
    findOrganizationById?(orgId: string): Promise<any | null>;
    /**
     * Get user activity history
     * @param userId - User ID
     * @param limit - Number of activities to return
     * @param offset - Number of activities to skip
     * @returns Array of activity records
     */
    getActivityHistory?(userId: string, limit: number, offset: number): Promise<any[]>;
    /**
     * Log user activity
     * @param userId - User ID
     * @param action - Action performed
     * @param metadata - Additional metadata
     */
    logActivity?(userId: string, action: string, metadata?: Record<string, any>): Promise<void>;
    /**
     * Find users with pagination
     * @param limit - Number of users to return
     * @param offset - Number of users to skip
     * @param searchTerm - Optional search term
     * @param filters - Optional filters
     * @returns Paginated users
     */
    findPaginated(limit: number, offset: number, searchTerm?: string, filters?: {
        orgId?: string;
        role?: string;
        status?: string;
        emailVerified?: boolean;
    }): Promise<{
        users: User[];
        total: number;
        hasMore: boolean;
    }>;
    /**
     * Count users by organization
     * @param orgId - Organization ID
     * @returns User count
     */
    countByOrg(orgId: string): Promise<number>;
    /**
     * Count users by role
     * @param role - User role
     * @returns User count
     */
    countByRole(role: string): Promise<number>;
    /**
     * Count total users
     * @returns Total user count
     */
    count(): Promise<number>;
    /**
     * Find users by status
     * @param status - User status
     * @returns Array of users with the status
     */
    findByStatus(status: string): Promise<User[]>;
    /**
     * Find users with expired OTP
     * @returns Array of users with expired OTP
     */
    findUsersWithExpiredOtp(): Promise<User[]>;
    /**
     * Clean expired OTPs
     * @returns Number of cleaned OTPs
     */
    cleanExpiredOtps(): Promise<number>;
    /**
     * Check if email exists (excluding specific user)
     * @param email - Email to check
     * @param excludeUserId - User ID to exclude from check
     * @returns Whether email exists
     */
    emailExists(email: string, excludeUserId?: string): Promise<boolean>;
    /**
     * Update last login timestamp
     * @param id - User ID
     * @param loginTime - Login timestamp
     */
    updateLastLogin(id: string, loginTime: Date): Promise<void>;
    /**
     * Get user statistics
     * @returns User statistics
     */
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        pending: number;
        verified: number;
        unverified: number;
        byRole: Record<string, number>;
    }>;
}
//# sourceMappingURL=IUserRepo.d.ts.map