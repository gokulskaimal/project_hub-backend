import mongoose, { Document, Types } from "mongoose";
import { UserRole } from "../../domain/enums/UserRole";
export interface IUserDoc extends Document {
    _id: Types.ObjectId;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role: UserRole;
    provider?: string;
    googleId?: string;
    avatar?: string;
    orgId?: Types.ObjectId;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    otp?: string;
    otpExpiry: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    status?: "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING_VERIFICATION";
    lastLoginAt?: Date;
}
export type UserDocument = IUserDoc;
export declare const UserModel: mongoose.Model<IUserDoc, {}, {}, {}, mongoose.Document<unknown, {}, IUserDoc, {}, {}> & IUserDoc & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default UserModel;
//# sourceMappingURL=UserModel.d.ts.map