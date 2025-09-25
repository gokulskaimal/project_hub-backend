import { IUserRepo } from "../../domain/interface/IUserRepo"
import { User } from "../../domain/entities/User"
import UserModel, { IUserDoc } from "../models/UserModel"

export class UserRepo implements IUserRepo {
    private toDomainUser(userDoc: IUserDoc): User {
        const plain = userDoc.toObject({ virtuals: false })

        return {
            id: userDoc.id,
            email: plain.email,
            password: plain.password,
            role: plain.role,
            orgId: plain.orgId ? plain.orgId.toString() : undefined,
            otp: plain.otp,
            otpExpiry: plain.otpExpiry,
            emailVerified: plain.emailVerified,
            resetPasswordToken: plain.resetPasswordToken,
            resetPasswordExpires: plain.resetPasswordExpires,
        }
    }

    async create(user: Partial<User>): Promise<User> {
        const created = await UserModel.create(user)
        return this.toDomainUser(created)
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email })
        return user ? this.toDomainUser(user) : null
    }

    async findById(id: string): Promise<User | null> {
        const user = await UserModel.findById(id)
        return user ? this.toDomainUser(user) : null
    }

    async updatePassword(id: string, hashedPassword: string): Promise<void> {
        await UserModel.findByIdAndUpdate(id, {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        })
    }

    async setResetPasswordToken(email: string, token: string, expires: Date): Promise<void> {
        await UserModel.findOneAndUpdate(
            { email },
            { resetPasswordToken: token, resetPasswordExpires: expires }
        )
    }

    async findByResetToken(token: string): Promise<User | null> {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        })
        return user ? this.toDomainUser(user) : null
    }

    async verifyEmail(id: string): Promise<void> {
        await UserModel.findByIdAndUpdate(id, { emailVerified: true })
    }

    async updateProfile(id: string, data: Partial<User>): Promise<User> {
        const updated = await UserModel.findByIdAndUpdate(id, data, { new: true })
        if (!updated) throw new Error("User not found")
        return this.toDomainUser(updated)
    }

    async saveOtp(email: string, otp: string, expiry: Date): Promise<void> {
        await UserModel.findOneAndUpdate({ email }, { otp, otpExpiry: expiry })
    }

    async verifyOtp(email: string, otp: string): Promise<User | null> {
        const user = await UserModel.findOne({
            email,
            otp,
            otpExpiry: { $gt: new Date() },
        })
        return user ? this.toDomainUser(user) : null
    }
}