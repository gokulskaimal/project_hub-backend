import mongoose, { Document, Types } from 'mongoose'
import { UserRole } from '../../domain/enums/UserRole'


export interface IUserDoc extends Document {
    _id: Types.ObjectId
    email: string
    name : string
    password?: string
    role: UserRole
    orgId?: Types.ObjectId
    emailVerified: boolean
    otp?: string
    otpExpiry: Date
    resetPasswordToken?: string
    resetPasswordExpires?: Date
}


const UserSchema = new mongoose.Schema<IUserDoc>({
    email: { type: String, required: true, unique: true },
    name : {type:String},
    password: { type: String },
    role: { type: String, enum: Object.values(UserRole), required: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    emailVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
})


export default mongoose.model<IUserDoc>("User", UserSchema)