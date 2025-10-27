import { BaseRepository } from './BaseRepository';
import { IUserRepo } from '../../domain/interfaces/IUserRepo';
import { User } from '../../domain/entities/User';
import { IUserDoc } from '../models/UserModel';
export declare class UserRepo extends BaseRepository<User, IUserDoc> implements IUserRepo {
    constructor();
    protected toDomain(doc: IUserDoc): User;
    storeOtp(email: string, otp: string, expiry: Date): Promise<void>;
    getOtp(email: string): Promise<{
        otp: string;
        expiresAt: Date;
    } | null>;
    findOrganizationById?(orgId: string): Promise<any | null>;
    private toDomainUser;
    create(user: Partial<User>): Promise<User>;
    ensureUserWithOtp(email: string, otp: string, expiry: Date): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updatePassword(id: string, hashedPassword: string): Promise<void>;
    clearResetPasswordToken(id: string): Promise<void>;
    setResetPasswordToken(email: string, token: string, expires: Date): Promise<void>;
    findByResetToken(token: string): Promise<User | null>;
    verifyEmail(id: string): Promise<void>;
    updateProfile(id: string, data: Partial<User>): Promise<User>;
    saveOtp(email: string, otp: string, expiry: Date): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<User | null>;
    findByOrg(orgId: string): Promise<User[]>;
    findAll(): Promise<User[]>;
    delete(id: string): Promise<void>;
    findByRole(role: string): Promise<User[]>;
    findByOrgAndRole(orgId: string, role: string): Promise<User[]>;
    updateStatus(id: string, status: string): Promise<User>;
    hardDelete(id: string): Promise<void>;
    removeFromOrg(userId: string, _orgId: string): Promise<void>;
    updateLastLogin(id: string, loginTime: Date): Promise<void>;
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
    countByOrg(orgId: string): Promise<number>;
    countByRole(role: string): Promise<number>;
    count(): Promise<number>;
    findByStatus(status: string): Promise<User[]>;
    findUsersWithExpiredOtp(): Promise<User[]>;
    cleanExpiredOtps(): Promise<number>;
    emailExists(email: string, excludeUserId?: string): Promise<boolean>;
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        pending: number;
        verified: number;
        unverified: number;
        byRole: Record<string, number>;
    }>;
    getActivityHistory?(userId: string, limit: number, offset: number): Promise<any[]>;
    logActivity?(userId: string, action: string, metadata?: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=UserRepo.d.ts.map