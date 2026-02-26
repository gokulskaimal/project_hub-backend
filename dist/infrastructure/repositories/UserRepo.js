"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepo = void 0;
const inversify_1 = require("inversify");
const BaseRepo_1 = require("./BaseRepo");
const UserModel_1 = __importDefault(require("../models/UserModel"));
const UserRole_1 = require("../../domain/enums/UserRole");
const OrgModel_1 = __importDefault(require("../models/OrgModel"));
const types_1 = require("../container/types");
let UserRepo = class UserRepo extends BaseRepo_1.BaseRepository {
    constructor(_logger) {
        super(UserModel_1.default);
        this._logger = _logger;
    }
    toDomain(doc) {
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
    async storeOtp(email, otp, expiry) {
        try {
            await UserModel_1.default.findOneAndUpdate({ email }, { otp, otpExpiry: expiry }, { upsert: false });
        }
        catch (error) {
            this._logger.error(`Failed to store OTP`, error, { email });
            throw new Error(`Failed to store OTP: ${error.message}`);
        }
    }
    async getOtp(email) {
        try {
            const user = await UserModel_1.default.findOne({ email }).select("otp otpExpiry");
            if (!user || !user.otp || !user.otpExpiry) {
                return null;
            }
            return {
                otp: user.otp,
                expiresAt: user.otpExpiry,
            };
        }
        catch (error) {
            this._logger.error(`Failed to get OTP`, error, { email });
            throw new Error(`Failed to get OTP: ${error.message}`);
        }
    }
    async findOrganizationById(orgId) {
        try {
            const org = await OrgModel_1.default.findById(orgId);
            return org ? org.toObject() : null;
        }
        catch (error) {
            this._logger.error(`Failed to find organization by id`, error, {
                orgId,
            });
            throw new Error(`Failed to find organization by id: ${error.message}`);
        }
    }
    toDomainUser(userDoc) {
        return this.toDomain(userDoc);
    }
    async create(user) {
        const created = await UserModel_1.default.create({
            ...user,
            createdAt: new Date(),
            status: user.status || "PENDING_VERIFICATION",
            emailVerified: user.emailVerified || false,
        });
        return this.toDomainUser(created);
    }
    async ensureUserWithOtp(email, otp, expiry) {
        const existing = await UserModel_1.default.findOne({ email });
        const update = {
            otp,
            otpExpiry: expiry,
            emailVerified: false,
        };
        if (existing) {
            const updated = await UserModel_1.default.findOneAndUpdate({ email }, update, {
                new: true,
            });
            if (!updated)
                throw new Error("Unable to update OTP");
            return this.toDomainUser(updated);
        }
        const created = await UserModel_1.default.create({
            email,
            role: UserRole_1.UserRole.ORG_MANAGER,
            password: "",
            status: "PENDING_VERIFICATION",
            createdAt: new Date(),
            ...update,
        });
        return this.toDomainUser(created);
    }
    async findByEmail(email) {
        const user = await UserModel_1.default.findOne({ email });
        return user ? this.toDomainUser(user) : null;
    }
    async findById(id) {
        const doc = await this.model.findById(id);
        return doc ? this.toDomain(doc) : null;
    }
    async updatePassword(id, hashedPassword) {
        await UserModel_1.default.findByIdAndUpdate(id, {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
    }
    async clearResetPasswordToken(id) {
        await UserModel_1.default.findByIdAndUpdate(id, {
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
    }
    async setResetPasswordToken(email, token, expires) {
        await UserModel_1.default.findOneAndUpdate({ email }, { resetPasswordToken: token, resetPasswordExpires: expires });
    }
    async findByResetToken(token) {
        const user = await UserModel_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        return user ? this.toDomainUser(user) : null;
    }
    async verifyEmail(id) {
        await UserModel_1.default.findByIdAndUpdate(id, {
            emailVerified: true,
            emailVerifiedAt: new Date(),
            status: "ACTIVE",
        });
    }
    async updateProfile(id, data) {
        const updated = await UserModel_1.default.findByIdAndUpdate(id, data, { new: true });
        if (!updated)
            throw new Error("User not found");
        return this.toDomainUser(updated);
    }
    async saveOtp(email, otp, expiry) {
        await UserModel_1.default.findOneAndUpdate({ email }, { otp, otpExpiry: expiry });
    }
    async verifyOtp(email, otp) {
        const user = await UserModel_1.default.findOne({
            email,
            otp,
            otpExpiry: { $gt: new Date() },
        });
        return user ? this.toDomainUser(user) : null;
    }
    async findByOrg(orgId) {
        const users = await UserModel_1.default.find({ orgId });
        return users.map((u) => this.toDomainUser(u));
    }
    async findAll() {
        const users = await UserModel_1.default.find();
        return users.map((u) => this.toDomainUser(u));
    }
    async delete(id) {
        const result = await UserModel_1.default.findByIdAndDelete(id);
        return !!result;
    }
    async findByRole(role) {
        try {
            const users = await UserModel_1.default.find({ role });
            return users.map((u) => this.toDomainUser(u));
        }
        catch (error) {
            this._logger.error("Error finding users by role:", error, {
                role,
            });
            throw error;
        }
    }
    async findByOrgAndRole(orgId, role) {
        try {
            const users = await UserModel_1.default.find({ orgId, role });
            return users.map((u) => this.toDomainUser(u));
        }
        catch (error) {
            this._logger.error("Error finding users by org and role:", error, { orgId, role });
            throw error;
        }
    }
    async updateStatus(id, status) {
        try {
            const updated = await UserModel_1.default.findByIdAndUpdate(id, { status }, { new: true });
            if (!updated)
                throw new Error("User not found");
            return this.toDomainUser(updated);
        }
        catch (error) {
            this._logger.error(`Failed to update user status`, error, {
                userId: id,
                status,
            });
            throw error;
        }
    }
    async removeFromOrg(userId, _orgId) {
        try {
            await UserModel_1.default.findByIdAndUpdate(userId, {
                orgId: null,
            });
        }
        catch (error) {
            this._logger.error(`Failed to remove user from org`, error, {
                userId,
                orgId: _orgId,
            });
            throw error;
        }
    }
    async updateLastLogin(id, loginTime) {
        try {
            await UserModel_1.default.findByIdAndUpdate(id, {
                lastLoginAt: loginTime,
            });
        }
        catch (error) {
            this._logger.error("Error updating last login:", error, {
                userId: id,
            });
        }
    }
    async findPaginated(limit, offset, searchTerm, filters) {
        try {
            const query = {
                // Exclude super admins from listing
                role: { $ne: UserRole_1.UserRole.SUPER_ADMIN },
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
                if (filters.orgId)
                    query.orgId = filters.orgId;
                if (filters.role)
                    query.role = filters.role;
                if (filters.status)
                    query.status = filters.status;
                if (filters.emailVerified !== undefined)
                    query.emailVerified = filters.emailVerified;
            }
            const [docs, total] = await Promise.all([
                UserModel_1.default.find(query).skip(offset).limit(limit).sort({ createdAt: -1 }),
                UserModel_1.default.countDocuments(query),
            ]);
            return {
                users: docs.map((d) => this.toDomainUser(d)),
                total,
                hasMore: offset + limit < total,
            };
        }
        catch (error) {
            this._logger.error("Error finding paginated users:", error);
            throw error;
        }
    }
    async countByOrg(orgId) {
        try {
            return await UserModel_1.default.countDocuments({ orgId });
        }
        catch (error) {
            this._logger.error("Error counting users by org:", error, {
                orgId,
            });
            throw error;
        }
    }
    async countByRole(role) {
        try {
            return await UserModel_1.default.countDocuments({ role });
        }
        catch (error) {
            this._logger.error("Error counting users by role:", error, {
                role,
            });
            throw error;
        }
    }
    async count() {
        try {
            return await UserModel_1.default.countDocuments();
        }
        catch (error) {
            this._logger.error("Error counting users:", error);
            throw error;
        }
    }
    async findByStatus(status) {
        try {
            const users = await UserModel_1.default.find({ status });
            return users.map((u) => this.toDomainUser(u));
        }
        catch (error) {
            this._logger.error("Error finding users by status:", error, {
                status,
            });
            throw error;
        }
    }
    async findUsersWithExpiredOtp() {
        try {
            const users = await UserModel_1.default.find({
                otpExpiry: { $lt: new Date() },
                otp: { $exists: true, $ne: null },
            });
            return users.map((u) => this.toDomainUser(u));
        }
        catch (error) {
            this._logger.error("Error finding users with expired OTP:", error);
            throw error;
        }
    }
    async cleanExpiredOtps() {
        try {
            const result = await UserModel_1.default.updateMany({ otpExpiry: { $lt: new Date() } }, { $unset: { otp: 1, otpExpiry: 1 } });
            return result.modifiedCount;
        }
        catch (error) {
            this._logger.error("Error cleaning expired OTPs:", error);
            throw error;
        }
    }
    async emailExists(email, excludeUserId) {
        try {
            const query = { email };
            if (excludeUserId) {
                query._id = { $ne: excludeUserId };
            }
            const existing = await UserModel_1.default.findOne(query);
            return !!existing;
        }
        catch (error) {
            this._logger.error("Error checking if email exists:", error, {
                email,
            });
            throw error;
        }
    }
    async getStats() {
        try {
            const totalCount = await UserModel_1.default.countDocuments();
            const activeCount = await UserModel_1.default.countDocuments({ status: "ACTIVE" });
            const inactiveCount = await UserModel_1.default.countDocuments({
                status: "INACTIVE",
            });
            const pendingCount = await UserModel_1.default.countDocuments({
                status: "PENDING_VERIFICATION",
            });
            const verifiedCount = await UserModel_1.default.countDocuments({
                emailVerified: true,
            });
            const roleStats = await UserModel_1.default.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } },
            ]);
            const byRole = {};
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
        }
        catch (error) {
            this._logger.error("Error getting user stats:", error);
            throw error;
        }
    }
};
exports.UserRepo = UserRepo;
exports.UserRepo = UserRepo = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ILogger)),
    __metadata("design:paramtypes", [Object])
], UserRepo);
//# sourceMappingURL=UserRepo.js.map