import { UserRole } from "../enums/UserRole";

export interface User {
    id: string
    email: string
    name: string
    password: string
    role: UserRole
    orgId?: string
    otp?: string
    otpExpiry: Date
    emailVerified: boolean
    resetPasswordToken?: string
    resetPasswordExpires?: Date
}