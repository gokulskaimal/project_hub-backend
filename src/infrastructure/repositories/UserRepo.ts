import { injectable, inject } from "inversify";
import { BaseRepository } from "./BaseRepo";
import { IUserRepo } from "../interface/repositories/IUserRepo";
import { User } from "../../domain/entities/User";
import { Organization } from "../../domain/entities/Organization";
import UserModel, { IUserDoc } from "../models/UserModel";
import { UserRole } from "../../domain/enums/UserRole";
import OrgModel from "../models/OrgModel";
import { TYPES } from "../container/types";
import { ILogger } from "../interface/services/ILogger";

@injectable()
export class UserRepo
  extends BaseRepository<User, IUserDoc>
  implements IUserRepo
{
  constructor(@inject(TYPES.ILogger) private readonly _logger: ILogger) {
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
      avatar: plain.avatar,
      provider: plain.provider,
      googleId: plain.googleId,
    };
  }

  async findOrganizationById?(orgId: string): Promise<Organization | null> {
    try {
      const org = await OrgModel.findById(orgId);
      return org ? (org.toObject() as Organization) : null;
    } catch (error) {
      this._logger.error(`Failed to find organization by id`, error as Error, {
        orgId,
      });
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

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.toDomainUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.model.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const docs = await this.model.find({ _id: { $in: ids } });
    return docs.map((d) => this.toDomain(d));
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

  async findByOrg(orgId: string): Promise<User[]> {
    const users = await UserModel.find({ orgId });
    return users.map((u) => this.toDomainUser(u));
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users.map((u) => this.toDomainUser(u));
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByRole(role: string): Promise<User[]> {
    try {
      const users = await UserModel.find({ role });
      return users.map((u) => this.toDomainUser(u));
    } catch (error) {
      this._logger.error("Error finding users by role:", error as Error, {
        role,
      });
      throw error;
    }
  }

  async findByOrgAndRole(orgId: string, role: string): Promise<User[]> {
    try {
      const users = await UserModel.find({ orgId, role });
      return users.map((u) => this.toDomainUser(u));
    } catch (error) {
      this._logger.error(
        "Error finding users by org and role:",
        error as Error,
        { orgId, role },
      );
      throw error;
    }
  }

  async findByResetToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    return user ? this.toDomainUser(user) : null;
  }

  async findByEmailAndOtp(email: string, otp: string): Promise<User | null> {
    const user = await UserModel.findOne({
      email,
      otp,
      otpExpiry: { $gt: new Date() },
    });
    return user ? this.toDomainUser(user) : null;
  }

  async updateResetToken(
    email: string,
    token: string | undefined,
    expiry: Date | undefined,
  ): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      { $set: { resetPasswordToken: token, resetPasswordExpires: expiry } },
    );
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      {
        $set: { password: passwordHash },
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
      },
    );
  }

  async updateOtp(email: string, otp: string, expiry: Date): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      { $set: { otp, otpExpiry: expiry } },
    );
  }

  async clearOtp(email: string): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      { $unset: { otp: 1, otpExpiry: 1 } },
    );
  }

  async upsertOtpUser(
    email: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await UserModel.findOneAndUpdate(
      { email },
      {
        $set: { ...data, updatedAt: new Date() },
        $setOnInsert: {
          status: "PENDING_VERIFICATION",
          role: "USER",
          emailVerified: false,
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
  }

  async cleanExpiredOtps(): Promise<number> {
    const result = await UserModel.updateMany(
      { otpExpiry: { $lt: new Date() } },
      { $unset: { otp: 1, otpExpiry: 1 } },
    );
    return result.modifiedCount;
  }

  async countByStatus(status: string): Promise<number> {
    return await UserModel.countDocuments({ status });
  }

  async countVerified(): Promise<number> {
    return await UserModel.countDocuments({ emailVerified: true });
  }

  async getRoleDistribution(): Promise<Array<{ _id: string; count: number }>> {
    return await UserModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
  }

  async getGlobalStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
  }> {
    const results = await UserModel.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          verifiedCounts: [
            { $group: { _id: "$emailVerified", count: { $sum: 1 } } },
          ],
          roleCounts: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
        },
      },
    ]);

    const facet = results[0];
    const stats = {
      total: facet.total[0]?.count || 0,
      active: 0,
      inactive: 0,
      pending: 0,
      verified: 0,
      unverified: 0,
      byRole: {} as Record<string, number>,
    };

    facet.statusCounts.forEach((s: { _id: string; count: number }) => {
      if (s._id === "ACTIVE") stats.active = s.count;
      if (s._id === "INACTIVE" || s._id === "BLOCKED")
        stats.inactive += s.count;
      if (s._id === "PENDING_VERIFICATION") stats.pending = s.count;
    });

    facet.verifiedCounts.forEach((v: { _id: boolean; count: number }) => {
      if (v._id === true) stats.verified = v.count;
      if (v._id === false) stats.unverified = v.count;
    });

    facet.roleCounts.forEach((r: { _id: string; count: number }) => {
      stats.byRole[r._id || "UNKNOWN"] = r.count;
    });

    return stats;
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
      this._logger.error(`Failed to update user status`, error as Error, {
        userId: id,
        status,
      });
      throw error;
    }
  }

  async removeFromOrg(userId: string, _orgId: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(userId, {
        orgId: null,
      });
    } catch (error) {
      this._logger.error(`Failed to remove user from org`, error as Error, {
        userId,
        orgId: _orgId,
      });
      throw error;
    }
  }

  async updateLastLogin(id: string, loginTime: Date): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(id, {
        lastLoginAt: loginTime,
      });
    } catch (error) {
      this._logger.error("Error updating last login:", error as Error, {
        userId: id,
      });
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
      const query: Record<string, unknown> = {
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
      this._logger.error("Error finding paginated users:", error as Error);
      throw error;
    }
  }

  async countByOrg(orgId: string): Promise<number> {
    try {
      return await UserModel.countDocuments({ orgId });
    } catch (error) {
      this._logger.error("Error counting users by org:", error as Error, {
        orgId,
      });
      throw error;
    }
  }

  async countByRole(role: string): Promise<number> {
    try {
      return await UserModel.countDocuments({ role });
    } catch (error) {
      this._logger.error("Error counting users by role:", error as Error, {
        role,
      });
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      return await UserModel.countDocuments();
    } catch (error) {
      this._logger.error("Error counting users:", error as Error);
      throw error;
    }
  }

  async findByStatus(status: string): Promise<User[]> {
    try {
      const users = await UserModel.find({ status });
      return users.map((u) => this.toDomainUser(u));
    } catch (error) {
      this._logger.error("Error finding users by status:", error as Error, {
        status,
      });
      throw error;
    }
  }

  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const query: Record<string, unknown> = { email };
      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }
      const existing = await UserModel.findOne(query);
      return !!existing;
    } catch (error) {
      this._logger.error("Error checking if email exists:", error as Error, {
        email,
      });
      throw error;
    }
  }
}
