/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable } from "inversify";
import { BaseRepository } from "./BaseRepository";
import { IUserRepo } from "../../domain/interfaces/IUserRepo";
import { User } from "../../domain/entities/User";
import UserModel, { IUserDoc } from "../models/UserModel";
import { UserRole } from "../../domain/enums/UserRole";
import OrgModel from "../models/OrgModel";

@injectable()
export class UserRepo
  extends BaseRepository<User, IUserDoc>
  implements IUserRepo
{
  constructor() {
    super(UserModel);
  }

  protected toDomain(doc: IUserDoc): User {
    const plain = doc.toObject();
    return {
      id: doc.id,
      email: plain.email,
      name: plain.name,
      firstName: plain.firstName,
      lastName: plain.lastName,
      password: plain.password,
      role: plain.role,
      orgId: plain.orgId?.toString(),
      otp: plain.otp,
      otpExpiry: plain.otpExpiry,
      emailVerified: plain.emailVerified,
      emailVerifiedAt: plain.emailVerifiedAt,
      status: plain.status,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
      lastLoginAt: plain.lastLoginAt,
      resetPasswordToken: plain.resetPasswordToken,
      resetPasswordExpires: plain.resetPasswordExpires,
    };
  }

  async storeOtp(email: string, otp: string, expiry: Date): Promise<void> {
    try {
      await UserModel.findOneAndUpdate(
        { email },
        { otp, otpExpiry: expiry },
        { upsert: false },
      );
    } catch (error) {
      throw new Error(`Failed to store OTP: ${(error as Error).message}`);
    }
  }
  async getOtp(
    email: string,
  ): Promise<{ otp: string; expiresAt: Date } | null> {
    try {
      const user = await UserModel.findOne({ email }).select("otp otpExpiry");

      if (!user || !user.otp || !user.otpExpiry) {
        return null;
      }

      return {
        otp: user.otp,
        expiresAt: user.otpExpiry,
      };
    } catch (error) {
      throw new Error(`Failed to get OTP: ${(error as Error).message}`);
    }
  }
  async findOrganizationById?(orgId: string): Promise<unknown | null> {
    try {
      const org = await OrgModel.findById(orgId);
      return org ? org.toObject() : null;
    } catch (error) {
      throw new Error(
        `Failed to find organization by id: ${(error as Error).message}`,
      );
    }
  }

  private toDomainUser(userDoc: IUserDoc): User {
    return this.toDomain(userDoc);
  }

  async create(user: Partial<User>): Promise<User> {
    const created = await UserModel.create({
      ...user,
      createdAt: new Date(),
      status: user.status || "PENDING_VERIFICATION",
      emailVerified: user.emailVerified || false,
    });
    return this.toDomainUser(created);
  }

  async ensureUserWithOtp(
    email: string,
    otp: string,
    expiry: Date,
  ): Promise<User> {
    const existing = await UserModel.findOne({ email });

    const update = {
      otp,
      otpExpiry: expiry,
      emailVerified: false,
    };

    if (existing) {
      const updated = await UserModel.findOneAndUpdate({ email }, update, {
        new: true,
      });

      if (!updated) throw new Error("Unable to update OTP");
      return this.toDomainUser(updated);
    }

    const created = await UserModel.create({
      email,
      role: UserRole.ORG_MANAGER,
      password: "",
      status: "PENDING_VERIFICATION",
      createdAt: new Date(),
      ...update,
    });

    return this.toDomainUser(created);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.toDomainUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.toDomainUser(user) : null;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async clearResetPasswordToken(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  async setResetPasswordToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires },
    );
  }

  async findByResetToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    return user ? this.toDomainUser(user) : null;
  }

  async verifyEmail(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    });
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const updated = await UserModel.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error("User not found");
    return this.toDomainUser(updated);
  }

  async saveOtp(email: string, otp: string, expiry: Date): Promise<void> {
    await UserModel.findOneAndUpdate({ email }, { otp, otpExpiry: expiry });
  }

  async verifyOtp(email: string, otp: string): Promise<User | null> {
    const user = await UserModel.findOne({
      email,
      otp,
      otpExpiry: { $gt: new Date() },
    });
    return user ? this.toDomainUser(user) : null;
  }

  async findByOrg(orgId: string): Promise<User[]> {
    const users = await UserModel.find({ orgId });
    return users.map((u) => this.toDomainUser(u));
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map((u) => this.toDomainUser(u));
  }

  async delete(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }

  async findByRole(role: string): Promise<User[]> {
    try {
      const users = await UserModel.find({ role });
      return users.map((u) => this.toDomainUser(u));
    } catch (error) {
      console.error("Error finding users by role:", error);
      return [];
    }
  }

  async findByOrgAndRole(orgId: string, role: string): Promise<User[]> {
    try {
      const users = await UserModel.find({ orgId, role });
      return users.map((u) => this.toDomainUser(u));
    } catch (error) {
      console.error("Error finding users by org and role:", error);
      return [];
    }
  }

  async updateStatus(id: string, status: string): Promise<User> {
    try {
      const updated = await UserModel.findByIdAndUpdate(
        id,
        { status },
        { new: true },
      );
      if (!updated) throw new Error("User not found");
      return this.toDomainUser(updated);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update user status: ${error.message}`);
      }
      throw new Error("Failed to update user status: Unknown error");
    }
  }

  // async hardDelete(id: string): Promise<void> {
  //   try {
  //     await UserModel.findByIdAndDelete(id);
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       throw new Error(`Failed to hard delete user: ${error.message}`);
  //     }
  //     throw new Error("Failed to hard delete user: Unknown error");
  //   }
  // }

  async removeFromOrg(userId: string, _orgId: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        orgId: null,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to remove user from org: ${error.message}`);
      }
      throw new Error("Failed to remove user from org: Unknown error");
    }
  }

  async updateLastLogin(id: string, loginTime: Date): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(id, {
        lastLoginAt: loginTime,
      });
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  async findPaginated(
    limit: number,
    offset: number,
    searchTerm?: string,
    filters?: {
      orgId?: string;
      role?: string;
      status?: string;
      emailVerified?: boolean;
    },
  ): Promise<{
    users: User[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const query: any = {
        // Exclude super admins from listing
        role: { $ne: UserRole.SUPER_ADMIN },
      };

      if (searchTerm) {
        query.$or = [
          { email: { $regex: searchTerm, $options: "i" } },
          { name: { $regex: searchTerm, $options: "i" } },
          { firstName: { $regex: searchTerm, $options: "i" } },
          { lastName: { $regex: searchTerm, $options: "i" } },
        ];
      }

      if (filters) {
        if (filters.orgId) query.orgId = filters.orgId;
        if (filters.role) query.role = filters.role;
        if (filters.status) query.status = filters.status;
        if (filters.emailVerified !== undefined)
          query.emailVerified = filters.emailVerified;
      }

      const [docs, total] = await Promise.all([
        UserModel.find(query).skip(offset).limit(limit).sort({ createdAt: -1 }),
        UserModel.countDocuments(query),
      ]);

      return {
        users: docs.map((d) => this.toDomainUser(d)),
        total,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error("Error finding paginated users:", error);
      return {
        users: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  async countByOrg(orgId: string): Promise<number> {
    try {
      return await UserModel.countDocuments({ orgId });
    } catch (error) {
      console.error("Error counting users by org:", error);
      return 0;
    }
  }

  async countByRole(role: string): Promise<number> {
    try {
      return await UserModel.countDocuments({ role });
    } catch (error) {
      console.error("Error counting users by role:", error);
      return 0;
    }
  }

  async count(): Promise<number> {
    try {
      return await UserModel.countDocuments();
    } catch (error) {
      console.error("Error counting users:", error);
      return 0;
    }
  }

  async findByStatus(status: string): Promise<User[]> {
    try {
      const users = await UserModel.find({ status });
      return users.map((u) => this.toDomainUser(u));
    } catch (error) {
      console.error("Error finding users by status:", error);
      return [];
    }
  }

  async findUsersWithExpiredOtp(): Promise<User[]> {
    try {
      const users = await UserModel.find({
        otpExpiry: { $lt: new Date() },
        otp: { $exists: true, $ne: null },
      });
      return users.map((u) => this.toDomainUser(u));
    } catch (error) {
      console.error("Error finding users with expired OTP:", error);
      return [];
    }
  }

  async cleanExpiredOtps(): Promise<number> {
    try {
      const result = await UserModel.updateMany(
        { otpExpiry: { $lt: new Date() } },
        { $unset: { otp: 1, otpExpiry: 1 } },
      );
      return result.modifiedCount;
    } catch (error) {
      console.error("Error cleaning expired OTPs:", error);
      return 0;
    }
  }

  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const query: any = { email };
      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }
      const existing = await UserModel.findOne(query);
      return !!existing;
    } catch (error) {
      console.error("Error checking if email exists:", error);
      return false;
    }
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
  }> {
    try {
      const totalCount = await UserModel.countDocuments();
      const activeCount = await UserModel.countDocuments({ status: "ACTIVE" });
      const inactiveCount = await UserModel.countDocuments({
        status: "INACTIVE",
      });
      const pendingCount = await UserModel.countDocuments({
        status: "PENDING_VERIFICATION",
      });
      const verifiedCount = await UserModel.countDocuments({
        emailVerified: true,
      });

      const roleStats = await UserModel.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]);

      const byRole: Record<string, number> = {};
      roleStats.forEach((stat) => {
        byRole[stat._id || "UNKNOWN"] = stat.count;
      });

      return {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        pending: pendingCount,
        verified: verifiedCount,
        unverified: totalCount - verifiedCount,
        byRole,
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        verified: 0,
        unverified: 0,
        byRole: {},
      };
    }
  }

  // ✅ OPTIONAL METHODS WITH PROPER SIGNATURES
  // async getActivityHistory?(
  //   userId: string,
  //   limit: number,
  //   offset: number,
  // ): Promise<any[]> {
  //   console.log(
  //     `Getting activity history for user ${userId} (limit: ${limit}, offset: ${offset})`,
  //   );
  //   return [];
  // }

  // async logActivity?(
  //   userId: string,
  //   action: string,
  //   metadata?: Record<string, any>,
  // ): Promise<void> {
  //   console.log(`Logging activity for user ${userId}: ${action}`, metadata);
  // }
}
