import { User } from "../entities/User";

export interface IUserRepo{
    create(user : Partial<User>) : Promise<User>
    findByEmail(email : string) : Promise<User | null>
    findById(id:string) : Promise<User | null>
    updatePassword(id : string , hashedPassword : string) : Promise<void>
    setResetPasswordToken(token : string) : Promise<User | null>
    findByResetToken(token : string) : Promise<User | null>
    verifyEmail(id : string) : Promise<void>
    updateProfile(id : string , data : Partial<User>) : Promise<User>
    saveOtp(email : string , otp : string , expiry : Date) : Promise<void>
    verifyOtp(email : string , otp : string) : Promise<User | null>
}